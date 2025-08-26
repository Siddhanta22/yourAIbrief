import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  frequency: z.enum(['daily','weekly','monthly']).optional(),
  preferredSendTime: z.string().min(1).optional(),
  topics: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email }, include: { userInterests: true } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    name: user.name,
    preferredSendTime: user.preferredSendTime ?? null,
    preferences: user.preferences ?? {},
    topics: user.userInterests.map(ui => ui.category),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, frequency, preferredSendTime, topics } = updateSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const newPrefs: any = { ...(existing.preferences as any) };
    if (frequency) newPrefs.frequency = frequency;

    let updated;
    if (Array.isArray(topics)) {
      updated = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { email },
          data: {
            name: name !== undefined ? name : existing.name,
            preferredSendTime: preferredSendTime ?? existing.preferredSendTime ?? null,
            preferences: newPrefs,
          },
        });
        await tx.userInterest.deleteMany({ where: { userId: u.id } });
        if (topics.length > 0) {
          await tx.userInterest.createMany({
            data: topics.map((category) => ({ userId: u.id, category })),
            skipDuplicates: true,
          });
        }
        return u;
      });
    } else {
      updated = await prisma.user.update({
        where: { email },
        data: {
          name: name !== undefined ? name : existing.name,
          preferredSendTime: preferredSendTime ?? existing.preferredSendTime ?? null,
          preferences: newPrefs,
        },
      });
    }

    const interests = await prisma.userInterest.findMany({ where: { userId: updated.id } });
    return NextResponse.json({ success: true, user: { email: updated.email, name: updated.name, preferredSendTime: updated.preferredSendTime, preferences: updated.preferences, topics: interests.map(i => i.category) } });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to update preferences' }, { status: 400 });
  }
}


