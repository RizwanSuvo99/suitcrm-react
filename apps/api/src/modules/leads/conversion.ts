import { prisma } from '../../core/prisma.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../core/errors.js';
import { writeAuditLog } from '../../core/audit.js';
import type { LeadConvert, LeadConvertResult } from '@suitecrm/shared';

export interface ConvertLeadInput {
  leadId: string;
  tenantId: string;
  userId: string;
  opts: LeadConvert;
}

export async function convertLead(input: ConvertLeadInput): Promise<LeadConvertResult> {
  const lead = await prisma.lead.findFirst({
    where: { id: input.leadId, tenantId: input.tenantId, deletedAt: null },
  });
  if (!lead) throw new NotFoundError(`Lead ${input.leadId} not found`);
  if (lead.convertedAt) throw new ConflictError('Lead has already been converted');

  return prisma.$transaction(async (tx) => {
    let accountId: string | null = lead.convertedAccountId;
    let contactId: string | null = lead.convertedContactId;
    let opportunityId: string | null = lead.convertedOpportunityId;

    if (input.opts.createAccount && !accountId) {
      if (!lead.company) {
        throw new BadRequestError('Lead has no company; cannot create account on conversion');
      }
      const account = await tx.account.create({
        data: {
          tenantId: input.tenantId,
          name: lead.company,
          phone: lead.phone,
          email: lead.email,
          assignedUserId: lead.assignedUserId,
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      });
      accountId = account.id;
    }

    if (input.opts.createContact && !contactId) {
      const contact = await tx.contact.create({
        data: {
          tenantId: input.tenantId,
          firstName: lead.firstName,
          lastName: lead.lastName,
          title: lead.title,
          email: lead.email,
          phoneWork: lead.phone,
          accountId,
          assignedUserId: lead.assignedUserId,
          leadSource: lead.leadSource,
          description: lead.description,
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      });
      contactId = contact.id;
    }

    if (input.opts.createOpportunity && !opportunityId) {
      if (!input.opts.opportunityName) {
        throw new BadRequestError('opportunityName is required when createOpportunity is true');
      }
      const opp = await tx.opportunity.create({
        data: {
          tenantId: input.tenantId,
          name: input.opts.opportunityName,
          accountId,
          amount: input.opts.opportunityAmount ?? null,
          closeDate: input.opts.opportunityCloseDate
            ? new Date(input.opts.opportunityCloseDate)
            : null,
          leadSource: lead.leadSource,
          assignedUserId: lead.assignedUserId,
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      });
      opportunityId = opp.id;
    }

    await tx.lead.update({
      where: { id: lead.id },
      data: {
        status: 'Converted',
        convertedAt: new Date(),
        convertedAccountId: accountId,
        convertedContactId: contactId,
        convertedOpportunityId: opportunityId,
        updatedBy: input.userId,
      },
    });

    await writeAuditLog({
      tenantId: input.tenantId,
      userId: input.userId,
      entityType: 'Lead',
      entityId: lead.id,
      action: 'update',
      changes: { converted: true, accountId, contactId, opportunityId },
    });

    return { leadId: lead.id, accountId, contactId, opportunityId };
  });
}
