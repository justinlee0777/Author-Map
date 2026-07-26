import z from 'zod';

import {
  AmericanLiteraryAward,
  AwardInclusionReason,
  ClassicPublisher,
  ClassicPublisherCatalog,
  PersonalReason,
  type Author,
  type AuthorGroupReason,
  type AuthorInclusionReason,
  type ClassicPublisherReason,
  type PoetLaureateReason,
} from './models.js';

export const PoetLaureateReasonSchema: z.Schema<PoetLaureateReason> = z.object({
  type: z.literal('Poet Laureate'),
  referenceUrl: z.url(),
  dates: z.array(
    z.object({
      startYear: z.number(),
      endDate: z.number().optional(),
    }),
  ),
});

export const AuthorGroupReasonSchema: z.Schema<AuthorGroupReason> = z.object({
  type: z.literal('Belongs to a renowned group'),
  referenceUrl: z.url(),
  groupId: z.string(),
});

export const ClassicPublisherCatalogSchema: z.Schema<ClassicPublisherCatalog> =
  z.object({
    books: z.array(z.object({ referenceUrl: z.url(), name: z.string() })),
  });

export const ClassicPublisherReasonSchema: z.Schema<ClassicPublisherReason> =
  z.object({
    type: z.literal('Published as classical literature'),
    publishers: z.record(
      z.enum(ClassicPublisher),
      ClassicPublisherCatalogSchema.optional(),
    ),
  });

export const AwardInclusionReasonSchema: z.Schema<AwardInclusionReason> =
  z.object({
    type: z.literal('award'),
    referenceUrl: z.url(),
    award: z.enum(AmericanLiteraryAward),
    year: z.number(),
    book: z.string().optional(),
  });

export const PersonalReasonSchema: z.Schema<PersonalReason> = z.object({
  type: z.literal('Because I said so; source: me'),
});

export const AuthorInclusionReasonSchema: z.Schema<AuthorInclusionReason> =
  z.union([
    PoetLaureateReasonSchema,
    AuthorGroupReasonSchema,
    ClassicPublisherReasonSchema,
    AwardInclusionReasonSchema,
    PersonalReasonSchema,
  ]);

export const AuthorSchema: z.Schema<Author> = z.object({
  id: z.string(),
  authorFirstName: z.string(),
  authorLastName: z.string(),
  inclusionReasons: z.array(AuthorInclusionReasonSchema),
  authorFullName: z.string().optional(),
  authorDisplayName: z.string().optional(),
  link: z.url().optional(),
  wikimediaId: z.string().optional(),
  portrait: z
    .object({
      src: z.url().optional(),
    })
    .optional(),
  groups: z.array(z.string()).optional(),
});
