import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Couple } from '@/lib/models/Couple';
import { Transaction } from '@/lib/models/Transaction';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.coupleId) return NextResponse.json({ error: 'No couple connected' }, { status: 403 });

    await dbConnect();
    const couple = await Couple.findOne({ _id: session.coupleId } as any).lean();
    if (!couple) return NextResponse.json({ transactions: [], totalIncome: 0, totalExpense: 0, balance: 0 });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
      coupleId: couple._id,
      date: { $gte: startOfMonth }
    } as any)
      .sort({ date: -1 })
      .lean();

    let totalIncome = 0;
    let totalExpense = 0;

    const formattedTxs = transactions.map((tx: any) => {
      if (tx.type === 'income') totalIncome += tx.amount;
      else totalExpense += tx.amount;
      
      return {
        id: tx._id.toString(),
        name: tx.description || (tx.type === 'income' ? 'Income' : 'Expense'),
        category: tx.category,
        emoji: tx.category === 'Food' ? '🍕' : tx.category === 'Entertainment' ? '🍿' : tx.category === 'Salary' ? '💰' : '💸',
        amount: tx.amount,
        date: tx.date.toISOString(),
        paidBy: tx.paidBy,
        type: tx.type || 'expense'
      };
    });

    const balance = totalIncome - totalExpense;

    return NextResponse.json({ transactions: formattedTxs, totalIncome, totalExpense, balance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.coupleId) return NextResponse.json({ error: 'No couple connected' }, { status: 403 });

    await dbConnect();
    const couple = await Couple.findOne({ _id: session.coupleId } as any).lean();
    if (!couple) return NextResponse.json({ error: 'Couple not found' }, { status: 404 });

    const body = await req.json();

    const newTx = await Transaction.create({
      coupleId: couple._id,
      amount: body.amount,
      category: body.category,
      date: body.date || new Date(),
      description: body.name,
      type: body.type || 'expense',
      paidBy: body.paidBy || 'joint'
    });

    return NextResponse.json({
      id: newTx._id.toString(),
      name: newTx.description || (newTx.type === 'income' ? 'Income' : 'Expense'),
      category: newTx.category,
      emoji: newTx.category === 'Food' ? '🍕' : newTx.category === 'Entertainment' ? '🍿' : newTx.category === 'Salary' ? '💰' : '💸',
      amount: newTx.amount,
      date: newTx.date.toISOString(),
      paidBy: newTx.paidBy,
      type: newTx.type || 'expense'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
