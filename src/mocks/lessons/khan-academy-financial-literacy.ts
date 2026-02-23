/**
 * Khan Academy Financial Literacy Course
 *
 * Course content based on Khan Academy's Financial Literacy course.
 * Original course: https://www.khanacademy.org/college-careers-more/financial-literacy
 *
 * Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
 *
 * © Khan Academy
 */

import { LessonCourse } from '@/src/types/lesson';

export const KHAN_ACADEMY_FINANCIAL_LITERACY: LessonCourse = {
  id: 'khan_academy_financial_literacy',
  title: 'Khan Academy Financial Literacy',
  description:
    'Build a strong foundation for your financial future. From budgeting and saving to investing and retirement, this course covers the essential money skills everyone needs.',
  attribution: 'Khan Academy',
  license: 'CC BY-NC-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  sourceUrl: 'https://www.khanacademy.org/college-careers-more/financial-literacy',
  units: [
    // ─────────────────────────────────────────────────────────────────
    // UNIT 1: Budgeting and Saving
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'unit_budgeting_saving',
      courseId: 'khan_academy_financial_literacy',
      title: 'Budgeting and Saving',
      description: 'Learn how to create a budget, track your spending, and build healthy saving habits.',
      icon: '💰',
      lessons: [
        {
          id: 'lesson_basics',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_budgeting_saving',
          title: 'Welcome to Financial Literacy',
          description: 'Discover what financial literacy is and why it\'s one of the most important life skills you can develop.',
          estimatedMinutes: 5,
          difficulty: 'Beginner',
          reward: 300,
          content: [
            {
              type: 'paragraph',
              text: 'Financial literacy is the ability to understand and effectively use various financial skills, including personal financial management, budgeting, and investing. Being financially literate gives you the tools to make smart choices about money throughout your life.',
            },
            {
              type: 'paragraph',
              text: 'Think about the major financial decisions you will face: choosing a bank account, taking out a student loan, buying a car, renting an apartment, saving for retirement. Without a foundation in financial literacy, these decisions can feel overwhelming — and costly mistakes are easy to make.',
            },
            {
              type: 'keypoint',
              icon: '📊',
              text: 'According to the FINRA Investor Education Foundation, only 34% of Americans can correctly answer four basic financial literacy questions. This course will change that for you.',
            },
            {
              type: 'heading',
              text: 'Why Financial Literacy Matters',
            },
            {
              type: 'paragraph',
              text: 'Poor financial literacy costs people real money. High-interest debt, predatory lending, and missed investment opportunities are all more likely when you don\'t understand how money works. On the flip side, people who are financially literate tend to save more, invest earlier, and accumulate significantly more wealth over their lifetimes.',
            },
            {
              type: 'list',
              items: [
                'Make informed decisions about spending and saving',
                'Avoid predatory financial products',
                'Build wealth steadily over time',
                'Navigate major life purchases with confidence',
                'Plan for retirement and financial security',
              ],
            },
            {
              type: 'keypoint',
              icon: '💡',
              text: 'Financial literacy isn\'t about being rich — it\'s about making the most of whatever money you have.',
            },
          ],
          questions: [
            {
              id: 'q1_basics_1',
              question: 'What is financial literacy?',
              answers: [
                'The ability to read and write financial documents',
                'Having a lot of money in the bank',
                'The ability to understand and effectively use financial skills like budgeting and investing',
                'Knowing the current stock market prices',
              ],
              correctIndex: 2,
              explanation:
                'Financial literacy is the ability to understand and effectively apply financial skills — including budgeting, saving, investing, and managing debt. It\'s about knowledge and decision-making, not just having money.',
            },
            {
              id: 'q1_basics_2',
              question: 'Why is financial literacy considered an important life skill?',
              answers: [
                'Because it helps you earn a higher salary',
                'Because it enables you to make informed decisions about money throughout your life',
                'Because all jobs require knowledge of personal finance',
                'Because the government requires it for citizenship',
              ],
              correctIndex: 1,
              explanation:
                'Financial literacy matters because major life decisions — from choosing bank accounts to buying homes and saving for retirement — all involve money. Being informed helps you avoid costly mistakes and make choices that align with your goals.',
            },
          ],
        },
        {
          id: 'lesson_budgeting_basics',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_budgeting_saving',
          title: 'What Is a Budget?',
          description: 'Learn what a budget is, why it matters, and how to build one that works for your life.',
          estimatedMinutes: 7,
          difficulty: 'Beginner',
          reward: 400,
          content: [
            {
              type: 'paragraph',
              text: 'A budget is a plan for how you will spend and save your money over a set period of time — usually a month. At its core, budgeting means deciding in advance where your money will go, rather than wondering where it went after the fact.',
            },
            {
              type: 'paragraph',
              text: 'Every budget has two main parts: income and expenses. Income is money coming in — wages, freelance work, allowances, gifts. Expenses are money going out — rent, groceries, subscriptions, entertainment. A budget balances these two sides.',
            },
            {
              type: 'example',
              title: 'Simple Monthly Budget Example',
              body: 'Monthly take-home pay: $2,500',
              rows: [
                { label: 'Rent', value: '$900' },
                { label: 'Groceries', value: '$300' },
                { label: 'Transportation', value: '$200' },
                { label: 'Utilities', value: '$150' },
                { label: 'Entertainment', value: '$150' },
                { label: 'Savings', value: '$400' },
                { label: 'Remaining', value: '$400' },
              ],
            },
            {
              type: 'heading',
              text: 'Fixed vs. Variable Expenses',
            },
            {
              type: 'paragraph',
              text: 'Fixed expenses stay the same every month — rent, loan payments, insurance premiums. Variable expenses change — groceries, gas, dining out, clothing. When building a budget, it\'s easier to start with fixed expenses since they\'re predictable, then plan around what\'s left for variable spending.',
            },
            {
              type: 'keypoint',
              icon: '💡',
              text: 'You don\'t need a spreadsheet or app to budget. Even a simple handwritten list of income and expenses is a budget — what matters is the habit of planning.',
            },
          ],
          questions: [
            {
              id: 'q2_budget_1',
              question: 'What is the primary purpose of a budget?',
              answers: [
                'To restrict your spending as much as possible',
                'To plan how you will spend and save your money over a set period',
                'To track how much money you spent last month',
                'To calculate how much tax you owe',
              ],
              correctIndex: 1,
              explanation:
                'A budget is a forward-looking plan — you decide in advance where your money will go. This gives you control over your finances rather than reacting to where money already went.',
            },
            {
              id: 'q2_budget_2',
              question: 'Which of the following is an example of a FIXED expense?',
              answers: [
                'Dining out at restaurants',
                'Monthly gym membership fee',
                'Grocery spending',
                'Gasoline for your car',
              ],
              correctIndex: 1,
              explanation:
                'A fixed expense is one that stays the same every month. A gym membership is typically a set monthly fee. Dining out, groceries, and gas are variable — the amounts change from month to month.',
            },
            {
              id: 'q2_budget_3',
              question: 'In the example budget shown, how much is left after all expenses and savings?',
              answers: ['$0', '$150', '$400', '$900'],
              correctIndex: 2,
              explanation:
                'The total income is $2,500. After all expenses ($900 + $300 + $200 + $150 + $150 = $1,700) and savings ($400), the total accounted for is $2,100, leaving $400 remaining.',
            },
          ],
        },
        {
          id: 'lesson_50_30_20',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_budgeting_saving',
          title: 'Budgeting and the 50/30/20 Rule',
          description: 'Use the popular 50/30/20 framework to divide your income into needs, wants, and savings.',
          estimatedMinutes: 6,
          difficulty: 'Beginner',
          reward: 400,
          content: [
            {
              type: 'paragraph',
              text: 'The 50/30/20 rule is a simple budgeting guideline popularized by U.S. Senator Elizabeth Warren in her book "All Your Worth." It suggests dividing your after-tax income into three broad categories: 50% for needs, 30% for wants, and 20% for savings and debt repayment.',
            },
            {
              type: 'example',
              title: 'Applying 50/30/20 to a $3,000 Monthly Income',
              rows: [
                { label: 'Needs (50%)', value: '$1,500' },
                { label: 'Wants (30%)', value: '$900' },
                { label: 'Savings/Debt (20%)', value: '$600' },
              ],
            },
            {
              type: 'heading',
              text: 'Needs vs. Wants',
            },
            {
              type: 'paragraph',
              text: 'Needs are expenses required for basic living: housing, utilities, groceries, transportation to work, minimum loan payments, and necessary medical care. Wants are everything that improves your life but isn\'t strictly necessary: streaming services, dining out, vacations, new clothes beyond basics, hobbies.',
            },
            {
              type: 'paragraph',
              text: 'The line between needs and wants isn\'t always obvious. A car might be a need if you live somewhere without public transit, but a luxury car upgrade is a want. Groceries are a need; buying premium organic everything might blur into wants.',
            },
            {
              type: 'keypoint',
              icon: '⚠️',
              text: 'The 50/30/20 rule is a guideline, not a rigid law. If you live in a high-cost city, your needs may exceed 50%. Adjust the percentages to fit your reality — what matters is having a plan.',
            },
          ],
          questions: [
            {
              id: 'q3_rule_1',
              question: 'According to the 50/30/20 rule, what percentage of after-tax income should go toward "wants"?',
              answers: ['20%', '50%', '30%', '10%'],
              correctIndex: 2,
              explanation:
                'The 50/30/20 rule divides income into: 50% for needs (essentials), 30% for wants (lifestyle choices), and 20% for savings and debt repayment.',
            },
            {
              id: 'q3_rule_2',
              question: 'Which of the following is most likely a "NEED" under the 50/30/20 framework?',
              answers: [
                'Monthly streaming service subscription',
                'Rent payment',
                'Dining out at restaurants',
                'New video game purchase',
              ],
              correctIndex: 1,
              explanation:
                'Rent is a basic living expense — you need shelter. Streaming services, dining out, and video games are wants: they improve quality of life but aren\'t required for basic functioning.',
            },
          ],
        },
        {
          id: 'lesson_saving',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_budgeting_saving',
          title: 'Why and How to Save',
          description: 'Explore why saving is the cornerstone of financial health, including emergency funds and savings account types.',
          estimatedMinutes: 8,
          difficulty: 'Beginner',
          reward: 500,
          content: [
            {
              type: 'paragraph',
              text: 'Saving money is the foundation of financial security. At its simplest, saving means spending less than you earn and setting aside the difference. But the purpose and strategy behind saving can be surprisingly nuanced.',
            },
            {
              type: 'heading',
              text: 'The Emergency Fund',
            },
            {
              type: 'paragraph',
              text: 'An emergency fund is money set aside specifically to cover unexpected expenses: a medical bill, a car repair, sudden job loss. Financial experts generally recommend having three to six months of living expenses in an emergency fund, stored in an easily accessible savings account.',
            },
            {
              type: 'example',
              title: 'Emergency Fund Target Calculation',
              body: 'Monthly expenses: $2,000',
              rows: [
                { label: '3-month minimum', value: '$6,000' },
                { label: '6-month recommended', value: '$12,000' },
              ],
            },
            {
              type: 'heading',
              text: 'Pay Yourself First',
            },
            {
              type: 'paragraph',
              text: '"Pay yourself first" means automatically saving a set amount from each paycheck before you spend anything. Instead of saving whatever is left over (which is often nothing), you treat savings like a mandatory expense. Many employers allow direct deposit splits so a portion goes straight to savings.',
            },
            {
              type: 'heading',
              text: 'Types of Savings Accounts',
            },
            {
              type: 'list',
              items: [
                'Regular Savings Account: Low interest (0.01–0.5%), offered by traditional banks, FDIC-insured up to $250,000.',
                'High-Yield Savings Account (HYSA): Offered by online banks, typically 4–5%+ APY. Same FDIC insurance, better returns.',
                'Money Market Account: Higher interest rates, often requires a minimum balance. May include check-writing privileges.',
                'Certificate of Deposit (CD): Fixed interest rate for a fixed term. Higher rates but money is locked up — early withdrawal penalties apply.',
              ],
            },
            {
              type: 'keypoint',
              icon: '💡',
              text: 'For your emergency fund, a High-Yield Savings Account (HYSA) is usually the best choice: your money is safe, accessible within a day or two, and earns meaningfully more than a traditional savings account.',
            },
          ],
          questions: [
            {
              id: 'q4_saving_1',
              question: 'How many months of living expenses do financial experts typically recommend keeping in an emergency fund?',
              answers: ['1–2 months', '3–6 months', '12–18 months', 'Just $1,000'],
              correctIndex: 1,
              explanation:
                'The standard recommendation is three to six months of living expenses. Three months is the minimum to cover most short-term emergencies; six months provides a stronger buffer for job loss or major unexpected costs.',
            },
            {
              id: 'q4_saving_2',
              question: 'What does "pay yourself first" mean?',
              answers: [
                'Spending money on yourself before paying bills',
                'Automatically saving a set amount from each paycheck before spending',
                'Paying off your credit card balance immediately after every purchase',
                'Investing all your money in the stock market',
              ],
              correctIndex: 1,
              explanation:
                '"Pay yourself first" means automating savings so the money is set aside before you have a chance to spend it. This removes willpower from the equation and ensures savings actually happen.',
            },
            {
              id: 'q4_saving_3',
              question: 'Which type of savings account typically offers the highest interest rate with easy access to your money?',
              answers: [
                'Regular savings account at a traditional bank',
                'Certificate of Deposit (CD)',
                'High-Yield Savings Account (HYSA)',
                'Checking account',
              ],
              correctIndex: 2,
              explanation:
                'High-Yield Savings Accounts, typically offered by online banks, provide much higher interest rates than traditional savings accounts — often 4–5%+ APY — while keeping your money accessible. CDs offer high rates too but lock your money up for a fixed term.',
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    // UNIT 2: Consumer Credit
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'unit_consumer_credit',
      courseId: 'khan_academy_financial_literacy',
      title: 'Consumer Credit',
      description: 'Understand credit scores, credit cards, and interest rates — and learn how to use credit as a tool, not a trap.',
      icon: '💳',
      lessons: [
        {
          id: 'lesson_credit_scores',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_consumer_credit',
          title: 'Understanding Credit Scores',
          description: 'Learn what a credit score is, how it\'s calculated, and why it affects your financial life.',
          estimatedMinutes: 8,
          difficulty: 'Beginner',
          reward: 500,
          content: [
            {
              type: 'paragraph',
              text: 'A credit score is a three-digit number — typically between 300 and 850 — that represents how likely you are to repay borrowed money based on your credit history. Lenders, landlords, and sometimes even employers use it to evaluate your financial responsibility.',
            },
            {
              type: 'heading',
              text: 'How Credit Scores Are Calculated (FICO)',
            },
            {
              type: 'paragraph',
              text: 'The most widely used credit scoring model is the FICO score. It is calculated using five factors, each weighted differently:',
            },
            {
              type: 'example',
              title: 'FICO Score Breakdown',
              rows: [
                { label: 'Payment History', value: '35%' },
                { label: 'Amounts Owed (Utilization)', value: '30%' },
                { label: 'Length of Credit History', value: '15%' },
                { label: 'New Credit (Inquiries)', value: '10%' },
                { label: 'Credit Mix', value: '10%' },
              ],
            },
            {
              type: 'heading',
              text: 'Credit Score Ranges',
            },
            {
              type: 'example',
              title: 'Score Tiers',
              rows: [
                { label: 'Exceptional', value: '800–850' },
                { label: 'Very Good', value: '740–799' },
                { label: 'Good', value: '670–739' },
                { label: 'Fair', value: '580–669' },
                { label: 'Poor', value: '300–579' },
              ],
            },
            {
              type: 'paragraph',
              text: 'The biggest factor — payment history at 35% — means paying your bills on time is the single most impactful thing you can do for your credit score. Even one missed payment can significantly lower your score and stay on your credit report for seven years.',
            },
            {
              type: 'keypoint',
              icon: '💡',
              text: 'Credit utilization — how much of your available credit you\'re using — is the second biggest factor. Try to keep your utilization below 30%. If you have a $1,000 credit limit, aim to keep your balance below $300.',
            },
          ],
          questions: [
            {
              id: 'q5_credit_1',
              question: 'What is the single most important factor in calculating a FICO credit score?',
              answers: [
                'The total amount of debt you owe',
                'How many credit cards you have',
                'Your payment history',
                'Your income level',
              ],
              correctIndex: 2,
              explanation:
                'Payment history accounts for 35% of your FICO score — the largest single factor. Consistently paying bills on time is the most effective way to build and maintain a strong credit score.',
            },
            {
              id: 'q5_credit_2',
              question: 'If you have a credit card with a $2,000 limit, what balance should you aim to stay below to maintain healthy credit utilization?',
              answers: ['$100', '$600', '$1,000', '$1,500'],
              correctIndex: 1,
              explanation:
                'The general guideline is to keep credit utilization below 30%. With a $2,000 limit, 30% is $600. Keeping your balance at or below $600 helps demonstrate responsible credit use.',
            },
          ],
        },
        {
          id: 'lesson_credit_cards',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_consumer_credit',
          title: 'Credit Cards Explained',
          description: 'Learn how credit cards work, how interest is charged, and how to use them without falling into debt.',
          estimatedMinutes: 7,
          difficulty: 'Beginner',
          reward: 400,
          content: [
            {
              type: 'paragraph',
              text: 'A credit card lets you borrow money from a bank to make purchases, with an agreement to repay later. Used responsibly, credit cards are powerful tools: they build credit history, offer purchase protections, and provide rewards. Used carelessly, they trap people in high-interest debt.',
            },
            {
              type: 'heading',
              text: 'How Interest Works on Credit Cards',
            },
            {
              type: 'paragraph',
              text: 'Every credit card has a grace period — typically 21 to 25 days after your billing cycle ends. If you pay your full balance before the due date, you pay zero interest. If you carry a balance, you\'re charged interest on what you owe, often at very high rates (15–29% APR is common).',
            },
            {
              type: 'example',
              title: 'The True Cost of Minimum Payments',
              body: '$3,000 balance at 22% APR, making only minimum payments ($30/month):',
              rows: [
                { label: 'Time to pay off', value: '~14 years' },
                { label: 'Total interest paid', value: '~$4,200' },
                { label: 'Total paid', value: '~$7,200' },
              ],
            },
            {
              type: 'heading',
              text: 'The Schumer Box',
            },
            {
              type: 'paragraph',
              text: 'Federal law requires credit card companies to include a standardized disclosure table — called the Schumer Box — in all card offers. It shows the APR, fees, minimum payment calculation, and penalty rates in a consistent format so consumers can compare cards easily.',
            },
            {
              type: 'keypoint',
              icon: '⚠️',
              text: 'The most important rule of credit cards: pay your full balance every month. If you can\'t afford to pay it off, you can\'t afford to buy it on credit.',
            },
          ],
          questions: [
            {
              id: 'q6_cards_1',
              question: 'What is a credit card\'s "grace period"?',
              answers: [
                'The time the bank gives you before reporting a late payment',
                'The period after your billing cycle where you can pay your full balance and owe no interest',
                'A fee waiver for new cardholders',
                'The minimum amount of time a card account must remain open',
              ],
              correctIndex: 1,
              explanation:
                'The grace period is the window (typically 21–25 days after the billing cycle ends) during which you can pay your full balance without being charged any interest. Taking advantage of this is key to using credit cards for free.',
            },
            {
              id: 'q6_cards_2',
              question: 'Based on the example shown, making only minimum payments on a $3,000 balance at 22% APR means you\'ll pay approximately how much in interest over time?',
              answers: ['$300', '$660', '$4,200', '$7,200'],
              correctIndex: 2,
              explanation:
                'Making only minimum payments results in approximately $4,200 in interest charges — meaning you end up paying $7,200 total for $3,000 worth of purchases. This illustrates why carrying a credit card balance is so costly.',
            },
          ],
        },
        {
          id: 'lesson_apr',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_consumer_credit',
          title: 'APR and Interest Rates',
          description: 'Understand what APR means, how interest accumulates on debt, and how to compare loan costs.',
          estimatedMinutes: 8,
          difficulty: 'Intermediate',
          reward: 500,
          content: [
            {
              type: 'paragraph',
              text: 'APR stands for Annual Percentage Rate. It represents the yearly cost of borrowing money, expressed as a percentage. APR includes both the interest rate and certain fees, making it the most useful number for comparing loan costs.',
            },
            {
              type: 'paragraph',
              text: 'Don\'t confuse APR with interest rate. The interest rate is the base cost of borrowing. APR is broader — it includes origination fees, closing costs, and other charges. A loan can have a low interest rate but a higher APR once fees are factored in.',
            },
            {
              type: 'example',
              title: '$10,000 Auto Loan for 5 Years — APR Comparison',
              rows: [
                { label: 'At 5% APR: Monthly payment', value: '$188.71' },
                { label: 'At 5% APR: Total interest', value: '$1,322.74' },
                { label: 'At 15% APR: Monthly payment', value: '$237.90' },
                { label: 'At 15% APR: Total interest', value: '$4,273.84' },
              ],
            },
            {
              type: 'heading',
              text: 'Compound Interest on Debt',
            },
            {
              type: 'paragraph',
              text: 'On most consumer debt — credit cards, personal loans — interest compounds. This means interest charges are added to your principal, and then future interest is calculated on that higher amount. Compound interest grows wealth when you invest, but it works against you when you borrow.',
            },
            {
              type: 'keypoint',
              icon: '💡',
              text: 'When comparing loan offers, always look at the APR — not just the interest rate. A loan with a slightly higher interest rate but lower fees may have a lower APR and cost you less overall.',
            },
          ],
          questions: [
            {
              id: 'q7_apr_1',
              question: 'What does APR stand for, and what does it measure?',
              answers: [
                'Average Payment Rate — the average monthly payment on a loan',
                'Annual Percentage Rate — the yearly cost of borrowing, including interest and fees',
                'Adjusted Principal Rate — the principal remaining after one year of payments',
                'Annual Principal Reduction — how much principal is paid down per year',
              ],
              correctIndex: 1,
              explanation:
                'APR (Annual Percentage Rate) represents the total yearly cost of a loan expressed as a percentage, including both the interest rate and applicable fees. It\'s the standardized figure used to compare the true cost of different loan products.',
            },
            {
              id: 'q7_apr_2',
              question: 'Based on the $10,000 auto loan example, how much more interest would you pay at 15% APR compared to 5% APR over 5 years?',
              answers: ['$500 more', '$1,322 more', '$2,951 more', '$4,274 more'],
              correctIndex: 2,
              explanation:
                'At 5% APR you pay $1,322.74 in interest; at 15% APR you pay $4,273.84. The difference is approximately $2,951 — demonstrating how significantly a higher interest rate compounds over time.',
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    // UNIT 3: Investments and Retirement
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'unit_investments',
      courseId: 'khan_academy_financial_literacy',
      title: 'Investments and Retirement',
      description: 'Discover how to grow your wealth through investing, and learn about the financial instruments that make it possible.',
      icon: '📈',
      lessons: [
        {
          id: 'lesson_investing_intro',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_investments',
          title: 'Introduction to Investing',
          description: 'Learn why investing is essential for building wealth, and understand the core concepts of risk, return, and diversification.',
          estimatedMinutes: 8,
          difficulty: 'Beginner',
          reward: 500,
          content: [
            {
              type: 'paragraph',
              text: 'Investing means putting your money to work with the expectation that it will grow over time. Unlike saving — where your money sits in a bank earning modest interest — investing means taking on some level of risk in exchange for the potential for higher returns.',
            },
            {
              type: 'heading',
              text: 'Why You Need to Invest',
            },
            {
              type: 'paragraph',
              text: 'Inflation erodes the purchasing power of money over time. If inflation averages 3% per year and your savings account earns 0.5%, your money is effectively losing value. Investing in assets that outpace inflation — historically, the U.S. stock market has returned around 7% per year on average after inflation — preserves and grows your purchasing power.',
            },
            {
              type: 'example',
              title: 'The Power of Starting Early',
              body: 'Investing $200/month at 7% average annual return:',
              rows: [
                { label: 'Starting at age 25 (40 years)', value: '$525,000' },
                { label: 'Starting at age 35 (30 years)', value: '$243,000' },
                { label: 'Starting at age 45 (20 years)', value: '$104,000' },
              ],
            },
            {
              type: 'heading',
              text: 'Risk vs. Return',
            },
            {
              type: 'paragraph',
              text: 'In investing, risk and return are related. Higher potential returns generally come with higher risk — the possibility of losing money. Cash in a savings account is very low risk but also very low return. Individual stocks offer high potential returns but also high volatility. A well-designed portfolio balances risk according to your goals and timeline.',
            },
            {
              type: 'heading',
              text: 'Diversification',
            },
            {
              type: 'paragraph',
              text: 'Diversification means spreading investments across many assets so that a single bad investment can\'t sink your whole portfolio. The old wisdom: "Don\'t put all your eggs in one basket." Owning shares in 500 companies through an index fund is far less risky than owning stock in just one company.',
            },
            {
              type: 'keypoint',
              icon: '💡',
              text: 'Time in the market beats timing the market. Starting early and staying invested consistently — even in small amounts — is more powerful than trying to invest at the "perfect" moment.',
            },
          ],
          questions: [
            {
              id: 'q8_invest_1',
              question: 'Why is investing important even when savings accounts exist?',
              answers: [
                'Investing is guaranteed to make money, while savings accounts are not',
                'Savings accounts are illegal for large amounts',
                'Inflation erodes the value of money, so investing in assets with higher returns helps preserve and grow purchasing power',
                'The government requires people to invest a portion of their income',
              ],
              correctIndex: 2,
              explanation:
                'Inflation averages around 3% per year, which means money sitting in a low-interest savings account gradually loses purchasing power. Investing in assets with returns that outpace inflation — like stocks — preserves and grows real wealth over time.',
            },
            {
              id: 'q8_invest_2',
              question: 'What does "diversification" mean in the context of investing?',
              answers: [
                'Investing all your money in the highest-performing asset',
                'Spreading investments across many assets to reduce the impact of any single investment performing poorly',
                'Changing your investments every month based on market conditions',
                'Only investing in industries you personally understand',
              ],
              correctIndex: 1,
              explanation:
                'Diversification means spreading your money across multiple investments so that poor performance in one doesn\'t devastate your entire portfolio. It\'s the financial equivalent of not putting all your eggs in one basket.',
            },
          ],
        },
        {
          id: 'lesson_commodities',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_investments',
          title: 'Commodities and Precious Metals',
          description: 'Understand what commodities are, why investors hold gold and silver, and how commodity investments behave.',
          estimatedMinutes: 8,
          difficulty: 'Intermediate',
          reward: 600,
          content: [
            {
              type: 'paragraph',
              text: 'Commodities are raw materials or primary agricultural products that can be bought and sold. Examples include oil, natural gas, wheat, corn, copper, and precious metals like gold and silver. Unlike stocks or bonds, commodities are physical goods with real-world supply and demand dynamics.',
            },
            {
              type: 'heading',
              text: 'Why Investors Hold Commodities',
            },
            {
              type: 'paragraph',
              text: 'Commodities serve several purposes in an investment portfolio. Most importantly, they often behave differently from stocks and bonds — when stock markets fall sharply, commodities like gold sometimes rise, providing a hedge against market downturns. Commodities also tend to hold their value during periods of high inflation.',
            },
            {
              type: 'heading',
              text: 'Gold as an Investment',
            },
            {
              type: 'paragraph',
              text: 'Gold has been considered a store of value for thousands of years. In modern investing, gold is often used as a "safe haven" asset — investors flock to it during periods of economic uncertainty, geopolitical tension, or high inflation. Gold doesn\'t pay dividends or interest; its value comes entirely from price appreciation and its role as a hedge.',
            },
            {
              type: 'example',
              title: 'Gold vs. Stocks During Market Crises',
              rows: [
                { label: '2008 Financial Crisis (stocks)', value: '-37%' },
                { label: '2008 Financial Crisis (gold)', value: '+5%' },
                { label: '2020 COVID Crash (stocks, March)', value: '-34%' },
                { label: '2020 COVID Crash (gold, March)', value: '+4%' },
              ],
            },
            {
              type: 'heading',
              text: 'How to Invest in Commodities',
            },
            {
              type: 'list',
              items: [
                'Physical ownership: Buying actual gold bars or coins. Secure but has storage/insurance costs.',
                'Commodity ETFs: Funds like GLD (SPDR Gold Trust) that track the price of gold without you needing to store it.',
                'Commodity futures: Contracts to buy/sell a commodity at a set price on a future date. Complex and only suitable for experienced investors.',
                'Commodity stocks: Shares in companies that mine or produce commodities (e.g., gold mining companies).',
              ],
            },
            {
              type: 'keypoint',
              icon: '⚠️',
              text: 'Commodities can be volatile and are generally more suitable as a small portion of a diversified portfolio rather than as a primary investment. Most financial advisors suggest limiting commodity exposure to 5–10% of a portfolio.',
            },
          ],
          questions: [
            {
              id: 'q9_commodities_1',
              question: 'What is a commodity?',
              answers: [
                'A share of ownership in a company',
                'A government-issued bond',
                'A raw material or primary product that can be bought and sold, such as oil, gold, or wheat',
                'A type of savings account with a fixed interest rate',
              ],
              correctIndex: 2,
              explanation:
                'A commodity is a raw material or primary agricultural/natural product that is interchangeable with other goods of the same type. Examples include oil, natural gas, gold, silver, wheat, and copper.',
            },
            {
              id: 'q9_commodities_2',
              question: 'Why might an investor hold gold in their portfolio even though it pays no dividends or interest?',
              answers: [
                'Gold always increases in value every year',
                'Gold serves as a hedge — it often holds or gains value during stock market downturns and inflationary periods',
                'Gold is required by law to be part of retirement accounts',
                'Gold has a guaranteed return set by the government',
              ],
              correctIndex: 1,
              explanation:
                'Gold is often called a "safe haven" asset because it tends to hold or increase in value when stock markets fall and during periods of high inflation. It provides diversification by behaving differently from traditional stocks and bonds.',
            },
          ],
        },
        {
          id: 'lesson_reits',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_investments',
          title: 'Real Estate Investment Trusts (REITs)',
          description: 'Learn how REITs let everyday investors participate in real estate income without buying property.',
          estimatedMinutes: 9,
          difficulty: 'Intermediate',
          reward: 600,
          content: [
            {
              type: 'paragraph',
              text: 'A Real Estate Investment Trust, or REIT (pronounced "reet"), is a company that owns, operates, or finances income-producing real estate. REITs were created by the U.S. Congress in 1960 to give everyday investors access to large-scale, income-producing real estate — the kind previously only available to wealthy individuals or large institutions.',
            },
            {
              type: 'heading',
              text: 'How REITs Work',
            },
            {
              type: 'paragraph',
              text: 'REITs pool capital from many investors to buy and manage a portfolio of real estate properties. In exchange for special tax treatment — REITs pay no corporate income tax — they must distribute at least 90% of their taxable income to shareholders as dividends. This makes REITs attractive income investments.',
            },
            {
              type: 'heading',
              text: 'Types of REITs',
            },
            {
              type: 'list',
              items: [
                'Equity REITs: Own and operate physical properties (apartments, office buildings, shopping centers, warehouses). Income comes primarily from rent.',
                'Mortgage REITs (mREITs): Finance real estate by originating or purchasing mortgages and mortgage-backed securities. Income comes from interest.',
                'Hybrid REITs: Combine both equity and mortgage strategies.',
              ],
            },
            {
              type: 'heading',
              text: 'REIT Sectors',
            },
            {
              type: 'paragraph',
              text: 'Equity REITs specialize in different types of properties: residential (apartments), retail (malls, strip centers), office, industrial (warehouses, logistics), healthcare (hospitals, senior living), data centers, and cell towers. The diversity of REIT sectors means you can add real estate exposure while targeting specific economic sectors.',
            },
            {
              type: 'example',
              title: 'REIT vs. Direct Real Estate Investment',
              rows: [
                { label: 'Minimum investment', value: '$50 vs. $50,000+' },
                { label: 'Liquidity', value: 'Instant vs. months' },
                { label: 'Diversification', value: '100s of properties vs. 1–2' },
                { label: 'Management required', value: 'None vs. significant' },
                { label: 'Dividend income', value: 'Automatic vs. manual' },
              ],
            },
            {
              type: 'keypoint',
              icon: '💡',
              text: 'REITs historically provide both dividend income and long-term capital appreciation. The Vanguard Real Estate ETF (VNQ), which holds REITs, has returned approximately 8–9% annually over long periods.',
            },
          ],
          questions: [
            {
              id: 'q10_reits_1',
              question: 'What is a key tax requirement that REITs must follow?',
              answers: [
                'REITs must pay a 50% corporate tax rate',
                'REITs must distribute at least 90% of their taxable income to shareholders as dividends',
                'REITs cannot own more than 10 properties at a time',
                'REITs must reinvest all profits back into new properties',
              ],
              correctIndex: 1,
              explanation:
                'In exchange for special tax treatment (paying no corporate income tax), REITs are legally required to distribute at least 90% of their taxable income to shareholders as dividends. This requirement is what makes REITs attractive income-generating investments.',
            },
            {
              id: 'q10_reits_2',
              question: 'Compared to directly buying a rental property, which advantage do publicly traded REITs offer?',
              answers: [
                'REITs always have higher returns than direct property ownership',
                'REITs are guaranteed never to lose value',
                'REITs offer much greater liquidity — shares can be bought or sold instantly on a stock exchange',
                'REITs are backed by the federal government',
              ],
              correctIndex: 2,
              explanation:
                'One of the biggest advantages of REITs over direct real estate ownership is liquidity. REIT shares trade on stock exchanges and can be bought or sold in seconds. Selling an actual property, by contrast, can take months and involves significant transaction costs.',
            },
          ],
        },
        {
          id: 'lesson_leveraged_etfs',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_investments',
          title: 'Leveraged ETFs: High Risk, High Reward',
          description: 'Understand how leveraged ETFs work, why they amplify both gains and losses, and why they\'re only for experienced investors.',
          estimatedMinutes: 10,
          difficulty: 'Advanced',
          reward: 800,
          content: [
            {
              type: 'paragraph',
              text: 'A leveraged ETF is an exchange-traded fund that uses financial derivatives and debt to amplify the returns of an underlying index. A "2x" leveraged ETF aims to deliver twice the daily return of its benchmark; a "3x" ETF aims for triple the daily return. They\'re designed for short-term traders, not long-term investors.',
            },
            {
              type: 'heading',
              text: 'How Leverage Works',
            },
            {
              type: 'paragraph',
              text: 'Leverage means using borrowed money to amplify your position. If you invest $100 in a 3x leveraged ETF tracking the NASDAQ-100, and the NASDAQ rises 1% today, your ETF rises approximately 3%. But if the NASDAQ falls 1%, your ETF falls approximately 3%.',
            },
            {
              type: 'example',
              title: 'Leverage Amplifies Both Gains AND Losses',
              body: '$1,000 invested. NASDAQ moves:',
              rows: [
                { label: '+5% day (1x ETF gain)', value: '+$50' },
                { label: '+5% day (3x ETF gain)', value: '+$150' },
                { label: '-5% day (1x ETF loss)', value: '-$50' },
                { label: '-5% day (3x ETF loss)', value: '-$150' },
              ],
            },
            {
              type: 'heading',
              text: 'Volatility Decay: The Hidden Risk',
            },
            {
              type: 'paragraph',
              text: 'The most misunderstood risk of leveraged ETFs is "volatility decay" (also called beta slippage). Because leveraged ETFs reset daily, gains and losses don\'t compound symmetrically over time. A series of up and down days — even if the market ends flat — will cause a leveraged ETF to lose value.',
            },
            {
              type: 'example',
              title: 'Volatility Decay in Action',
              body: '$1,000 in a 2x ETF. Market swings 10% each day:',
              rows: [
                { label: 'Day 1: Index +10% (ETF +20%)', value: '$1,200' },
                { label: 'Day 2: Index -10% (ETF -20%)', value: '$960' },
                { label: 'Index is back to: -1%', value: '$(1,000 → $990)' },
                { label: '2x ETF is at:', value: '$960 (-4%)' },
              ],
            },
            {
              type: 'paragraph',
              text: 'After these two days, the index is only down 1% but the 2x ETF is down 4%. In volatile, choppy markets, this effect compounds dramatically over time. This is why leveraged ETFs are explicitly labeled as short-term trading instruments in their prospectuses.',
            },
            {
              type: 'keypoint',
              icon: '⚠️',
              text: 'Leveraged ETFs like TQQQ (3x NASDAQ-100) can deliver extraordinary gains during strong bull markets — but can lose 90%+ of their value in a bear market. They are not appropriate as long-term "buy and hold" investments.',
            },
          ],
          questions: [
            {
              id: 'q11_lev_1',
              question: 'If a 3x leveraged ETF tracks the S&P 500 and the S&P 500 falls 4% in a single day, how much does the leveraged ETF approximately fall?',
              answers: ['1.3%', '4%', '8%', '12%'],
              correctIndex: 3,
              explanation:
                'A 3x leveraged ETF aims to deliver three times the daily return of its underlying index. If the index falls 4%, the 3x ETF falls approximately 3 × 4% = 12%. This amplification works in both directions.',
            },
            {
              id: 'q11_lev_2',
              question: 'What is "volatility decay" in a leveraged ETF?',
              answers: [
                'The management fees charged by the ETF every year',
                'The gradual loss of value that occurs in volatile markets because leveraged ETFs reset daily, causing asymmetric compounding',
                'The delay between when the index moves and when the ETF price updates',
                'A penalty charged when you sell a leveraged ETF',
              ],
              correctIndex: 1,
              explanation:
                'Volatility decay (or beta slippage) is the phenomenon where a leveraged ETF loses value over time in choppy markets, even if the underlying index ends flat. Because the ETF resets daily, the math of compounding gains and losses is asymmetric — losses always hurt more than equivalent gains help.',
            },
            {
              id: 'q11_lev_3',
              question: 'For which type of investor are leveraged ETFs primarily designed?',
              answers: [
                'Long-term retirement investors who want to maximize returns over 30 years',
                'Conservative investors who want to preserve capital',
                'Short-term traders looking to amplify daily market moves',
                'Beginning investors who are new to the stock market',
              ],
              correctIndex: 2,
              explanation:
                'Leveraged ETFs are explicitly designed for short-term trading — they seek to deliver a multiple of the index\'s daily return. Due to volatility decay, they are poorly suited for long-term buy-and-hold strategies and are inappropriate for conservative or beginning investors.',
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    // UNIT 4: Loans and Debt
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'unit_loans_debt',
      courseId: 'khan_academy_financial_literacy',
      title: 'Loans and Debt',
      description: 'Understand different types of debt, how interest accrues, and strategies for paying off what you owe.',
      icon: '🏦',
      lessons: [
        {
          id: 'lesson_loans_overview',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_loans_debt',
          title: 'Sources of Loans and Credit',
          description: 'Explore the different places you can borrow money, from banks to credit unions to payday lenders.',
          estimatedMinutes: 7,
          difficulty: 'Beginner',
          reward: 400,
          content: [
            {
              type: 'paragraph',
              text: 'At some point in life, most people borrow money. Understanding where to borrow — and where not to — is one of the most important financial decisions you can make. The source of a loan directly affects the interest rate you\'ll pay and the terms you\'ll face.',
            },
            {
              type: 'heading',
              text: 'Major Sources of Consumer Credit',
            },
            {
              type: 'list',
              items: [
                'Commercial Banks: Traditional banks offer mortgages, auto loans, personal loans, and credit cards. Rates are competitive for borrowers with good credit.',
                'Credit Unions: Member-owned nonprofits that often offer lower interest rates and fees than commercial banks. You must be eligible to join (by employer, location, or affiliation).',
                'Online Lenders: Fast approval, fully digital process. Rates vary widely — some are competitive, others predatory. Always compare APRs carefully.',
                'Federal Student Loans: Government-backed loans for education. Lower rates, income-driven repayment options, and potential forgiveness programs make these preferable to private loans.',
                'Payday Lenders: Short-term, high-fee loans against your next paycheck. Extremely expensive — effective APRs can exceed 400%.',
              ],
            },
            {
              type: 'example',
              title: 'Cost Comparison: $500 Borrowed for 2 Weeks',
              rows: [
                { label: 'Credit union (12% APR)', value: '$2.30 in interest' },
                { label: 'Credit card (22% APR)', value: '$4.23 in interest' },
                { label: 'Payday loan (400% APR)', value: '$76.92 in fees' },
              ],
            },
            {
              type: 'keypoint',
              icon: '⚠️',
              text: 'Payday loans and other predatory lending products are legal but designed to trap borrowers in cycles of debt. The effective APR on a typical two-week payday loan is often 300–500%. Avoid these whenever possible.',
            },
          ],
          questions: [
            {
              id: 'q12_loans_1',
              question: 'What is a key advantage of borrowing from a credit union instead of a commercial bank?',
              answers: [
                'Credit unions are backed by the federal government with no risk of loss',
                'Credit unions are member-owned nonprofits and often offer lower interest rates and fees',
                'Credit unions do not require credit checks',
                'Credit unions only lend to businesses, not individuals',
              ],
              correctIndex: 1,
              explanation:
                'Credit unions are member-owned nonprofits, which means their goal is to serve members rather than generate profit for shareholders. This structure typically results in lower interest rates on loans and lower fees compared to commercial banks.',
            },
            {
              id: 'q12_loans_2',
              question: 'Why are payday loans considered predatory?',
              answers: [
                'They require collateral like your car or home',
                'They have effective APRs that can exceed 300–400%, trapping borrowers in debt cycles',
                'They only lend to people with excellent credit',
                'They require repayment over 30 years like a mortgage',
              ],
              correctIndex: 1,
              explanation:
                'Payday loans charge very high fees for very short-term loans. When converted to an Annual Percentage Rate (APR), a typical payday loan fee works out to 300–500% or more per year. This makes them extremely expensive and can trap borrowers who can\'t repay the full amount on payday in a cycle of renewing the loan.',
            },
          ],
        },
        {
          id: 'lesson_debt_repayment',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_loans_debt',
          title: 'Debt Repayment Strategies',
          description: 'Compare the Avalanche and Snowball methods for paying off debt and learn which one saves you the most money.',
          estimatedMinutes: 8,
          difficulty: 'Intermediate',
          reward: 500,
          content: [
            {
              type: 'paragraph',
              text: 'If you carry multiple debts — credit cards, student loans, an auto loan — having a strategy to pay them off makes a significant difference in how long it takes and how much interest you pay. The two most popular strategies are the Debt Avalanche and the Debt Snowball.',
            },
            {
              type: 'heading',
              text: 'The Debt Avalanche (Mathematically Optimal)',
            },
            {
              type: 'paragraph',
              text: 'The Debt Avalanche method means paying minimum payments on all debts, then putting every extra dollar toward the debt with the highest interest rate. Once that\'s paid off, move the extra payment to the next-highest interest rate debt. This method minimizes total interest paid.',
            },
            {
              type: 'heading',
              text: 'The Debt Snowball (Psychologically Powerful)',
            },
            {
              type: 'paragraph',
              text: 'The Debt Snowball method means paying minimum payments on all debts, then putting every extra dollar toward the smallest balance first — regardless of interest rate. Each debt you eliminate frees up more to throw at the next one, creating momentum. Research shows this method works well for people who struggle with motivation.',
            },
            {
              type: 'example',
              title: 'Example: $500/month extra to pay toward debt',
              body: 'Three debts: Credit card ($3,000 at 22%), Car loan ($8,000 at 6%), Student loan ($12,000 at 5%)',
              rows: [
                { label: 'Avalanche: Total interest paid', value: '~$2,800' },
                { label: 'Avalanche: Payoff time', value: '~30 months' },
                { label: 'Snowball: Total interest paid', value: '~$3,200' },
                { label: 'Snowball: Payoff time', value: '~32 months' },
              ],
            },
            {
              type: 'keypoint',
              icon: '💡',
              text: 'The Avalanche saves more money mathematically, but the Snowball can keep you motivated by giving you quick wins. The "best" method is the one you\'ll actually stick to — choose based on your personality and financial situation.',
            },
          ],
          questions: [
            {
              id: 'q13_debt_1',
              question: 'What is the key difference between the Debt Avalanche and Debt Snowball methods?',
              answers: [
                'The Avalanche pays debts smallest to largest; the Snowball pays highest interest rate first',
                'The Avalanche pays highest interest rate first; the Snowball pays smallest balance first',
                'The Avalanche consolidates all debts into one; the Snowball keeps them separate',
                'The Avalanche is for mortgages only; the Snowball is for credit cards only',
              ],
              correctIndex: 1,
              explanation:
                'The Debt Avalanche focuses on the highest interest rate first (minimizing total interest paid), while the Debt Snowball focuses on the smallest balance first (building momentum through quick wins). Both involve paying minimums on all other debts while directing extra funds to the target debt.',
            },
            {
              id: 'q13_debt_2',
              question: 'Which debt repayment method saves the most money in total interest paid?',
              answers: [
                'The Debt Snowball, because you eliminate debts faster',
                'The Debt Avalanche, because you attack the highest interest rate first',
                'They always save the exact same amount',
                'Neither saves money — all that matters is the total amount owed',
              ],
              correctIndex: 1,
              explanation:
                'The Debt Avalanche saves the most money in total interest because you\'re eliminating the highest-rate debt first. This reduces the amount of interest that compounds on your most expensive debts. The Snowball may take slightly longer and cost a bit more in interest, but its psychological benefits can help some people stay committed.',
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    // UNIT 5: Scams and Fraud
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'unit_scams_fraud',
      courseId: 'khan_academy_financial_literacy',
      title: 'Scams and Fraud',
      description: 'Protect yourself from financial scams and fraud by learning to recognize the warning signs.',
      icon: '🛡️',
      lessons: [
        {
          id: 'lesson_financial_scams',
          courseId: 'khan_academy_financial_literacy',
          unitId: 'unit_scams_fraud',
          title: 'Recognizing Financial Scams',
          description: 'Identify the most common financial scams and learn how to protect yourself and your money.',
          estimatedMinutes: 7,
          difficulty: 'Beginner',
          reward: 400,
          content: [
            {
              type: 'paragraph',
              text: 'Financial fraud costs Americans billions of dollars every year. From phishing emails to investment scams, con artists continuously develop new techniques to steal money. The best defense is recognizing the warning signs before you become a victim.',
            },
            {
              type: 'heading',
              text: 'Common Financial Scams',
            },
            {
              type: 'list',
              items: [
                'Phishing: Fake emails, texts, or calls pretending to be your bank, the IRS, or other institutions. They try to steal passwords, account numbers, or Social Security numbers.',
                'Investment scams: "Guaranteed" high returns with no risk. Real investments always carry risk — anyone promising otherwise is lying.',
                'Romance scams: Building an online relationship to gain trust, then asking for money due to a "crisis."',
                'Lottery/prize scams: "You\'ve won! Just pay a small processing fee." Legitimate lotteries never require upfront payment.',
                'Debt relief scams: Companies that promise to eliminate debt for a fee, but often take your money and do nothing.',
              ],
            },
            {
              type: 'heading',
              text: 'Red Flags to Watch For',
            },
            {
              type: 'list',
              items: [
                'Unsolicited contact via phone, text, or email requesting financial information',
                'Pressure to act immediately ("This offer expires today!")',
                'Requests to pay with gift cards, wire transfers, or cryptocurrency',
                'Promises of guaranteed returns or "risk-free" investments',
                'Requests to keep the transaction secret',
              ],
            },
            {
              type: 'keypoint',
              icon: '🛑',
              text: 'Legitimate financial institutions, government agencies, and businesses will NEVER ask you to pay using gift cards or wire money to a foreign account. These payment methods are favored by scammers because they\'re nearly impossible to reverse.',
            },
          ],
          questions: [
            {
              id: 'q14_scams_1',
              question: 'What is a major red flag that a financial offer might be a scam?',
              answers: [
                'The offer includes detailed documentation',
                'The offer promises guaranteed high returns with no risk',
                'The company is registered with the SEC',
                'The offer allows you to take time to research before deciding',
              ],
              correctIndex: 1,
              explanation:
                'All legitimate investments carry some level of risk. When someone promises guaranteed high returns with zero risk, that is a classic sign of investment fraud — most famously associated with Ponzi schemes. Real investments cannot guarantee returns.',
            },
            {
              id: 'q14_scams_2',
              question: 'Why do scammers specifically request payment via gift cards or wire transfers?',
              answers: [
                'They are more convenient for everyone involved',
                'These payment methods are nearly impossible to reverse, leaving victims with no recourse',
                'These payment methods provide better fraud protection for the recipient',
                'Banks charge lower fees for these types of transactions',
              ],
              correctIndex: 1,
              explanation:
                'Gift cards and wire transfers are favored by scammers because once the money is sent, it\'s almost impossible to recover. Unlike credit cards or bank transfers between known accounts, these methods offer victims virtually no consumer protection or ability to reverse the transaction.',
            },
          ],
        },
      ],
    },
  ],
};

