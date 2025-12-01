import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { setLearningDollarsProgress } from '@/hooks/learning-progress';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

type LessonId = 'interest' | 'borrowing' | 'debt' | 'scenarios';

type QuizQuestion = {
    prompt: string;
    options: string[];
    correctIndex: number;
};

type LessonConfig = {
    id: LessonId;
    title: string;
    objective: string;
    reward: number;
    unlock: string;
    quiz: QuizQuestion[];
};

type QuizProgress = {
    questionIndex: number;
    lastSelection: number | null;
    isCorrect: boolean | null;
    awaitingAdvance: boolean;
    completed: boolean;
};

type UnlockModalState = {
    visible: boolean;
    feature: string;
};

const UNIT_LESSONS: LessonConfig[] = [
    {
        id: 'interest',
        title: 'Simple vs. Compound Interest',
        objective: 'Calculate future value of savings and loans.',
        reward: 400,
        unlock: 'Interest Meter',
        quiz: [
            {
                prompt: 'You deposit $1,000 at 5% simple interest for 4 years. How much interest accrues?',
                options: ['$50', '$200', '$540', '$1,200'],
                correctIndex: 1,
            },
            {
                prompt: 'What makes compound interest grow faster when the APR stays the same?',
                options: [
                    'Interest compounds more frequently throughout the year',
                    'Interest compounds only once per year',
                    'You withdraw the interest every year',
                    'Fees are added to the balance each month',
                ],
                correctIndex: 0,
            },
            {
                prompt: 'After 10 years at 8% APR, compound interest compared with simple interest...',
                options: [
                    'Stays equal because the APR is identical',
                    'Adds interest on past interest, so the balance is larger',
                    'Shrinks because compound interest charges extra fees',
                    'Only works on balances above $10,000',
                ],
                correctIndex: 1,
            },
        ],
    },
    {
        id: 'borrowing',
        title: 'Borrowing Basics',
        objective: 'Learn loans, credit scores, and minimum payments.',
        reward: 350,
        unlock: 'Loan Comparison Tool',
        quiz: [
            {
                prompt: 'Raising your credit score by 50 points typically...',
                options: [
                    'Lowers your APR because lenders see less risk',
                    'Raises your APR because you can borrow more',
                    'Only changes the term length, not the rate',
                    'Cancels origination fees automatically',
                ],
                correctIndex: 0,
            },
            {
                prompt: 'Which metric best compares the true cost of two loan offers?',
                options: [
                    'Monthly payment only',
                    'Annual Percentage Rate (APR) that includes fees',
                    'Origination fee in dollars',
                    'How friendly the banker is',
                ],
                correctIndex: 1,
            },
            {
                prompt: 'Why is making just the minimum credit card payment expensive?',
                options: [
                    'Interest stops accruing on the remaining balance',
                    'The balance barely declines, so interest keeps piling up',
                    'Card issuers close the account',
                    'You lose any existing rewards',
                ],
                correctIndex: 1,
            },
        ],
    },
    {
        id: 'debt',
        title: 'Paying Off Debt',
        objective: 'Understand principal, interest, and amortization.',
        reward: 450,
        unlock: 'Debt Tracker',
        quiz: [
            {
                prompt: 'What is the principal on a loan?',
                options: [
                    'The original amount you borrowed before interest',
                    'The running total of interest charges',
                    'Only the fees charged at closing',
                    'The payment you send each month',
                ],
                correctIndex: 0,
            },
            {
                prompt: 'Paying more than the minimum each month does what to amortization?',
                options: [
                    'Extends the payoff schedule',
                    'Sends more of each payment to principal, shortening payoff time',
                    'Only reduces late fees',
                    'Hurts your credit score',
                ],
                correctIndex: 1,
            },
            {
                prompt: 'The debt avalanche method targets which balance first?',
                options: [
                    'The smallest balance regardless of rate',
                    'The balance with the highest interest rate',
                    'Any loan that has collateral',
                    'Student loans only',
                ],
                correctIndex: 1,
            },
        ],
    },
    {
        id: 'scenarios',
        title: 'Interest Rate Scenarios',
        objective: 'Compare outcomes of different rates over time.',
        reward: 500,
        unlock: 'Government Bonds · 5% APY',
        quiz: [
            {
                prompt: 'When market interest rates rise, existing bond prices usually...',
                options: [
                    'Fall so their yields stay competitive',
                    'Rise because investors chase them',
                    'Stay fixed regardless of rates',
                    'Double automatically',
                ],
                correctIndex: 0,
            },
            {
                prompt: 'When might low-yield government bonds be the smarter choice?',
                options: [
                    'When you need capital preservation and predictable income',
                    'When you want to day-trade volatile assets',
                    'When you need short-term cash in three days',
                    'When you are applying for a loan',
                ],
                correctIndex: 0,
            },
            {
                prompt: 'Choosing a high-yield fund instead of bonds mainly adds...',
                options: [
                    'Lower volatility with the same return',
                    'Higher potential return alongside bigger swings in value',
                    'Guaranteed principal protection',
                    'FDIC insurance on the investment',
                ],
                correctIndex: 1,
            },
        ],
    },
];

const formatCurrency = (value: number) =>
    `$${Math.round(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export default function LessonScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const cardBg = useThemeColor({}, 'cardBackground' as any);
    const primaryColor = useThemeColor({}, 'primary' as any);
    const successColor = useThemeColor({}, 'success' as any);
    const dangerColor = useThemeColor({}, 'danger' as any);
    const borderColor = useThemeColor({}, 'border' as any);

    const bodyTextColor = colorScheme === 'dark' ? '#F8FAFC' : '#111827';
    const mutedTextColor = colorScheme === 'dark' ? '#CBD5F5' : '#6B7280';
    const surfaceMutedColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : '#F3F4F6';
    const trackColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.15)' : '#E5E7EB';
    const bestPillBg = colorScheme === 'dark' ? 'rgba(34,197,94,0.22)' : '#DCFCE7';
    const bestPillText = colorScheme === 'dark' ? '#4ADE80' : '#16A34A';

    const bodyTextStyle = { color: bodyTextColor };
    const mutedTextStyle = { color: mutedTextColor };
    const statBoxBackgroundStyle = { backgroundColor: surfaceMutedColor };
    const trackBackgroundStyle = { backgroundColor: trackColor };
    const summaryFeatureChipStyle = {
        backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
        borderColor,
        borderWidth: 1,
    };

    const initialCompletionState = useMemo(() => {
        return UNIT_LESSONS.reduce<Record<LessonId, boolean>>((acc, lesson) => {
            acc[lesson.id] = false;
            return acc;
        }, {} as Record<LessonId, boolean>);
    }, []);

    const [lessonIndex, setLessonIndex] = useState(0);
    const [learningDollars, setLearningDollars] = useState(0);
    const [completedLessons, setCompletedLessons] =
        useState<Record<LessonId, boolean>>(initialCompletionState);
    const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>(['Portfolio Overview']);
    const [quizProgress, setQuizProgress] = useState<QuizProgress[]>(
        UNIT_LESSONS.map(() => ({
            questionIndex: 0,
            lastSelection: null,
            isCorrect: null,
            awaitingAdvance: false,
            completed: false,
        }))
    );
    const [unlockModal, setUnlockModal] = useState<UnlockModalState>({ visible: false, feature: '' });

    const [yearsSimulated, setYearsSimulated] = useState(0);
    const [creditScore, setCreditScore] = useState(680);
    const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
    const [debtStrategy, setDebtStrategy] = useState<'minimum' | 'accelerated'>('minimum');
    const [rateScenario, setRateScenario] = useState<'low' | 'high'>('low');
    const [loanChallengeComplete, setLoanChallengeComplete] = useState(false);
    const [debtChallengeComplete, setDebtChallengeComplete] = useState(false);
    const [rewardClaimed, setRewardClaimed] = useState(false);
    const [unitSummaryVisible, setUnitSummaryVisible] = useState(false);

    useEffect(() => {
        setLearningDollarsProgress(learningDollars);
    }, [learningDollars]);

    const currentLesson = UNIT_LESSONS[lessonIndex];
    const currentQuiz = quizProgress[lessonIndex];
    const currentQuestion =
        currentLesson.quiz[Math.min(currentLesson.quiz.length - 1, currentQuiz.questionIndex)];

    const completedCount = useMemo(
        () => UNIT_LESSONS.filter((lesson) => completedLessons[lesson.id]).length,
        [completedLessons]
    );
    const unlockedThisUnit = useMemo(
        () =>
            Array.from(
                new Set(unlockedFeatures.filter((feature) => feature !== 'Portfolio Overview'))
            ),
        [unlockedFeatures]
    );
    const progressPercent = (completedCount / UNIT_LESSONS.length) * 100;
    const isCurrentLessonComplete = completedLessons[currentLesson.id];
    const isFinalLesson = lessonIndex === UNIT_LESSONS.length - 1;
    const continueDisabled =
        !isCurrentLessonComplete ||
        unlockModal.visible ||
        unitSummaryVisible ||
        (isFinalLesson && rewardClaimed);

    const handleYearAdvance = () => setYearsSimulated((prev) => Math.min(prev + 1, 10));
    const handleYearReset = () => setYearsSimulated(0);

    const handleCreditScoreChange = (delta: number) => {
        setCreditScore((prev) => Math.max(580, Math.min(780, prev + delta)));
    };

    const handleLoanSelect = (loanId: string) => {
        setSelectedLoanId(loanId);
        if (loanId === 'loanA') {
            setLoanChallengeComplete(true);
        } else {
            setLoanChallengeComplete((prev) => prev);
        }
    };

    const handleStrategyChange = (strategy: 'minimum' | 'accelerated') => {
        setDebtStrategy(strategy);
        if (strategy === 'accelerated') {
            setDebtChallengeComplete(true);
        }
    };

    const handleScenarioSelect = (scenario: 'low' | 'high') => setRateScenario(scenario);

    const completeLesson = (lesson: LessonConfig, onFirstCompletion?: () => void) => {
        setCompletedLessons((prev) => {
            if (prev[lesson.id]) {
                return prev;
            }
            setLearningDollars((prevDollars) => prevDollars + lesson.reward);
            setUnlockedFeatures((prevFeatures) =>
                prevFeatures.includes(lesson.unlock) ? prevFeatures : [...prevFeatures, lesson.unlock]
            );
            onFirstCompletion?.();
            return { ...prev, [lesson.id]: true };
        });
    };

    const handleSelectAnswer = (answerIndex: number) => {
        const progress = quizProgress[lessonIndex];
        if (progress.completed || progress.awaitingAdvance) {
            return;
        }

        const isCorrect = answerIndex === currentQuestion.correctIndex;
        const isLastQuestion = progress.questionIndex === currentLesson.quiz.length - 1;

        setQuizProgress((prev) => {
            const updated = [...prev];
            updated[lessonIndex] = {
                ...prev[lessonIndex],
                lastSelection: answerIndex,
                isCorrect,
                awaitingAdvance: isCorrect && !isLastQuestion,
                completed: isCorrect && isLastQuestion,
            };
            return updated;
        });

        if (isCorrect && isLastQuestion) {
            completeLesson(currentLesson, () =>
                setUnlockModal({ visible: true, feature: currentLesson.unlock })
            );
        }
    };

    const handleAdvanceQuestion = () => {
        setQuizProgress((prev) => {
            const updated = [...prev];
            const current = updated[lessonIndex];
            if (!current.awaitingAdvance) {
                return prev;
            }
            updated[lessonIndex] = {
                ...current,
                questionIndex: Math.min(current.questionIndex + 1, currentLesson.quiz.length - 1),
                lastSelection: null,
                isCorrect: null,
                awaitingAdvance: false,
            };
            return updated;
        });
    };

    const handleContinue = () => {
        if (continueDisabled) {
            return;
        }

        if (!isFinalLesson) {
            setLessonIndex((prev) => prev + 1);
        } else if (!rewardClaimed) {
            setRewardClaimed(true);
            setUnitSummaryVisible(true);
        }
    };

    const closeUnlockModal = () => setUnlockModal({ visible: false, feature: '' });
    const closeSummaryModal = () => setUnitSummaryVisible(false);

    const renderInterestSimulator = () => {
        const principal = 1000;
        const rate = 0.08;
        const simpleValue = principal + principal * rate * yearsSimulated;
        const compoundValue = principal * Math.pow(1 + rate, yearsSimulated);
        const meterPercent = Math.min(1, compoundValue / (principal * 2.2));
        const gap = Math.max(0, compoundValue - simpleValue);

        return (
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <View style={styles.cardHeader}>
                    <ThemedText type="defaultSemiBold">Interest Meter</ThemedText>
                    <View style={[styles.pill, { backgroundColor: colors.primaryPale }]}>
                        <ThemedText style={[styles.pillText, { color: primaryColor }]}>
                            {yearsSimulated} yr
                        </ThemedText>
                    </View>
                </View>

                <ThemedText style={[styles.cardBodyText, bodyTextStyle]}>
                    Tap years to see how compound interest snowballs on principal plus previously earned interest.
                </ThemedText>

                <View style={styles.statRow}>
                    <View style={[styles.statBox, statBoxBackgroundStyle]}>
                        <ThemedText style={[styles.statLabel, mutedTextStyle]}>Simple</ThemedText>
                        <ThemedText type="defaultSemiBold" style={styles.statValue}>
                            {formatCurrency(simpleValue)}
                        </ThemedText>
                    </View>
                    <View style={[styles.statBox, statBoxBackgroundStyle]}>
                        <ThemedText style={[styles.statLabel, mutedTextStyle]}>Compound</ThemedText>
                        <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: successColor }]}>
                            {formatCurrency(compoundValue)}
                        </ThemedText>
                    </View>
                </View>

                <View style={[styles.meterTrack, trackBackgroundStyle]}>
                    <View
                        style={[styles.meterFill, { width: `${meterPercent * 100}%`, backgroundColor: primaryColor }]}
                    />
                </View>
                <ThemedText style={[styles.meterCaption, mutedTextStyle]}>
                    Compound interest earned {formatCurrency(gap)} more than simple interest.
                </ThemedText>

                <View style={styles.controlRow}>
                    <TouchableOpacity
                        style={[styles.controlButton, { borderColor }]}
                        onPress={handleYearAdvance}
                    >
                        <ThemedText style={[styles.controlButtonText, bodyTextStyle]}>+1 year</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlButton, { borderColor }]}
                        onPress={handleYearReset}
                    >
                        <ThemedText style={[styles.controlButtonText, bodyTextStyle]}>Reset</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderBorrowingBasics = () => {
        const estimatedApr = Math.max(7, 28 - (creditScore - 580) * 0.04).toFixed(1);
        const minimumPayment = Math.round((5000 * (parseFloat(estimatedApr) / 100)) / 12 + 80);
        const loanOffers = [
            {
                id: 'loanA',
                name: 'Smart Saver Loan',
                apr: 8.9,
                termMonths: 36,
                monthly: 320,
                fees: 80,
                mechanic: 'Lower interest, shorter term',
            },
            {
                id: 'loanB',
                name: 'Long Haul Loan',
                apr: 11.4,
                termMonths: 60,
                monthly: 240,
                fees: 0,
                mechanic: 'Lower monthly payment, more interest',
            },
        ];

        return (
            <View style={styles.cardGroup}>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.cardHeader}>
                        <ThemedText type="defaultSemiBold">Credit Score Gauge</ThemedText>
                        <ThemedText style={[styles.cardSubtext, mutedTextStyle]}>
                            Higher score → better loan offers
                        </ThemedText>
                    </View>
                    <View style={styles.scoreRow}>
                        <TouchableOpacity
                            style={[styles.scoreButton, { borderColor }]}
                            onPress={() => handleCreditScoreChange(-20)}
                        >
                            <ThemedText style={[styles.scoreButtonText, bodyTextStyle]}>-</ThemedText>
                        </TouchableOpacity>
                        <View style={styles.scoreValueBox}>
                            <ThemedText type="title">{creditScore}</ThemedText>
                            <ThemedText style={[styles.scoreLabel, mutedTextStyle]}>Projected score</ThemedText>
                        </View>
                        <TouchableOpacity
                            style={[styles.scoreButton, { borderColor }]}
                            onPress={() => handleCreditScoreChange(20)}
                        >
                            <ThemedText style={[styles.scoreButtonText, bodyTextStyle]}>+</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.statRow}>
                        <View style={[styles.statBox, statBoxBackgroundStyle]}>
                            <ThemedText style={[styles.statLabel, mutedTextStyle]}>Estimated APR</ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.statValue}>
                                {estimatedApr}%
                            </ThemedText>
                        </View>
                        <View style={[styles.statBox, statBoxBackgroundStyle]}>
                            <ThemedText style={[styles.statLabel, mutedTextStyle]}>Minimum payment</ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.statValue}>
                                {formatCurrency(minimumPayment)}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <ThemedText type="defaultSemiBold">Loan feature unlocked</ThemedText>
                    <ThemedText style={[styles.sectionCaption, mutedTextStyle]}>
                        Pick the offer with the lowest lifetime cost.
                    </ThemedText>
                </View>

                {loanOffers.map((offer) => {
                    const totalCost = offer.monthly * offer.termMonths + offer.fees;
                    const isSelected = selectedLoanId === offer.id;
                    const isBest = offer.id === 'loanA';

                    return (
                        <TouchableOpacity
                            key={offer.id}
                            style={[
                                styles.loanCard,
                                {
                                    backgroundColor: cardBg,
                                    borderColor: isSelected ? primaryColor : borderColor,
                                },
                            ]}
                            onPress={() => handleLoanSelect(offer.id)}
                        >
                            <View style={styles.loanHeader}>
                                <ThemedText type="defaultSemiBold">{offer.name}</ThemedText>
                                <ThemedText style={styles.loanApr}>{offer.apr}% APR</ThemedText>
                            </View>
                            <ThemedText style={[styles.loanMechanic, mutedTextStyle]}>{offer.mechanic}</ThemedText>
                            <View style={styles.loanStats}>
                                <View>
                                    <ThemedText style={[styles.loanLabel, mutedTextStyle]}>Monthly</ThemedText>
                                    <ThemedText type="defaultSemiBold">{formatCurrency(offer.monthly)}</ThemedText>
                                </View>
                                <View>
                                    <ThemedText style={[styles.loanLabel, mutedTextStyle]}>Term</ThemedText>
                                    <ThemedText type="defaultSemiBold">{offer.termMonths} months</ThemedText>
                                </View>
                                <View>
                                    <ThemedText style={[styles.loanLabel, mutedTextStyle]}>Fees</ThemedText>
                                    <ThemedText type="defaultSemiBold">{formatCurrency(offer.fees)}</ThemedText>
                                </View>
                            </View>
                            <View style={styles.loanFooter}>
                                <ThemedText style={[styles.loanLabel, mutedTextStyle]}>Lifetime cost</ThemedText>
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={{ color: isBest ? successColor : bodyTextColor }}
                                >
                                    {formatCurrency(totalCost)}
                                </ThemedText>
                            </View>
                            {isBest && (
                                <View style={[styles.bestPill, { backgroundColor: bestPillBg }]}>
                                    <ThemedText style={[styles.bestPillText, { color: bestPillText }]}>Best value</ThemedText>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}

                {selectedLoanId && (
                    <View
                        style={[
                            styles.feedbackCard,
                            {
                                borderColor: selectedLoanId === 'loanA' ? successColor : dangerColor,
                                backgroundColor:
                                    selectedLoanId === 'loanA' ? successColor + '15' : dangerColor + '15',
                            },
                        ]}
                    >
                        <ThemedText
                            style={[
                                styles.feedbackTitle,
                                { color: selectedLoanId === 'loanA' ? successColor : dangerColor },
                            ]}
                        >
                            {selectedLoanId === 'loanA' ? 'Nice pick!' : 'Costly choice'}
                        </ThemedText>
                        <ThemedText style={[styles.cardBodyText, bodyTextStyle]}>
                            {selectedLoanId === 'loanA'
                                ? 'Shorter term + lower APR keeps interest charges down and unlocks better borrowing power.'
                                : 'Lower monthly payments feel easy, but extra years mean hundreds more in interest.'}
                        </ThemedText>
                    </View>
                )}
            </View>
        );
    };

    const renderDebtTracker = () => {
        const strategies = {
            minimum: {
                label: 'Minimum payment',
                description: 'Pay $150/mo. Stay current but interest lingers.',
                months: 48,
                interest: 2200,
                progress: 0.35,
            },
            accelerated: {
                label: 'Debt sprint',
                description: 'Pay $250/mo using learning dollars. Crush balance quickly.',
                months: 26,
                interest: 900,
                progress: 0.65,
            },
        };
        const activeStrategy = strategies[debtStrategy];

        return (
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <View style={styles.cardHeader}>
                    <ThemedText type="defaultSemiBold">Debt Tracker</ThemedText>
                    <ThemedText style={[styles.cardSubtext, mutedTextStyle]}>Visualize payoff pace</ThemedText>
                </View>

                <View style={styles.toggleRow}>
                    {(['minimum', 'accelerated'] as const).map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.toggleButton,
                                {
                                    borderColor,
                                    backgroundColor: debtStrategy === option ? colors.primaryPale : 'transparent',
                                },
                            ]}
                            onPress={() => handleStrategyChange(option)}
                        >
                            <ThemedText
                                style={{
                                    color: debtStrategy === option ? primaryColor : bodyTextColor,
                                    fontWeight: '600',
                                }}
                            >
                                {strategies[option].label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedText style={[styles.cardBodyText, bodyTextStyle]}>{activeStrategy.description}</ThemedText>

                <View style={styles.statRow}>
                    <View style={[styles.statBox, statBoxBackgroundStyle]}>
                        <ThemedText style={[styles.statLabel, mutedTextStyle]}>Months to freedom</ThemedText>
                        <ThemedText type="defaultSemiBold" style={styles.statValue}>
                            {activeStrategy.months}
                        </ThemedText>
                    </View>
                    <View style={[styles.statBox, statBoxBackgroundStyle]}>
                        <ThemedText style={[styles.statLabel, mutedTextStyle]}>Interest paid</ThemedText>
                        <ThemedText
                            type="defaultSemiBold"
                            style={{ color: debtStrategy === 'accelerated' ? successColor : bodyTextColor }}
                        >
                            {formatCurrency(activeStrategy.interest)}
                        </ThemedText>
                    </View>
                </View>

                <View style={[styles.trackerBar, trackBackgroundStyle]}>
                    <View
                        style={[
                            styles.trackerFill,
                            {
                                width: `${activeStrategy.progress * 100}%`,
                                backgroundColor: debtStrategy === 'accelerated' ? successColor : primaryColor,
                            },
                        ]}
                    />
                </View>
                <ThemedText style={[styles.meterCaption, mutedTextStyle]}>
                    Boosted payments slice {formatCurrency(2200 - activeStrategy.interest)} of interest.
                </ThemedText>
            </View>
        );
    };

    const renderRateScenarios = () => {
        const scenarios = {
            low: {
                label: 'Government Bonds · 5% APY',
                description: 'Low-risk, steady interest that compounds quietly.',
                finalBalance: 6400,
                tone: successColor,
            },
            high: {
                label: 'High-Yield Tech Fund · 12% APY',
                description: 'Bigger upside but swings wildly—can lose value short-term.',
                finalBalance: 7800,
                tone: dangerColor,
            },
        };

        const activeScenario = scenarios[rateScenario];

        return (
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <View style={styles.cardHeader}>
                    <ThemedText type="defaultSemiBold">Rate Scenario Lab</ThemedText>
                    <ThemedText style={[styles.cardSubtext, mutedTextStyle]}>Compare long-term outcomes</ThemedText>
                </View>

                <View style={styles.toggleRow}>
                    {(['low', 'high'] as const).map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.toggleButton,
                                {
                                    borderColor,
                                    backgroundColor: rateScenario === option ? colors.primaryPale : 'transparent',
                                },
                            ]}
                            onPress={() => handleScenarioSelect(option)}
                        >
                            <ThemedText
                                style={{
                                    color: rateScenario === option ? primaryColor : bodyTextColor,
                                    fontWeight: '600',
                                }}
                            >
                                {scenarios[option].label.split('·')[0]}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedText type="defaultSemiBold" style={styles.scenarioLabel}>
                    {activeScenario.label}
                </ThemedText>
                <ThemedText style={[styles.cardBodyText, bodyTextStyle]}>
                    {activeScenario.description}
                </ThemedText>

                <View style={styles.statRow}>
                    <View style={[styles.statBox, statBoxBackgroundStyle]}>
                        <ThemedText style={[styles.statLabel, mutedTextStyle]}>Balance after 5 yrs</ThemedText>
                        <ThemedText type="defaultSemiBold" style={{ color: activeScenario.tone }}>
                            {formatCurrency(activeScenario.finalBalance)}
                        </ThemedText>
                    </View>
                    <View style={[styles.statBox, statBoxBackgroundStyle]}>
                        <ThemedText style={[styles.statLabel, mutedTextStyle]}>Volatility</ThemedText>
                        <ThemedText type="defaultSemiBold">
                            {rateScenario === 'low' ? 'Calm' : 'Spiky'}
                        </ThemedText>
                    </View>
                </View>
            </View>
        );
    };

    const renderInteractiveSection = () => {
        switch (currentLesson.id) {
            case 'interest':
                return renderInterestSimulator();
            case 'borrowing':
                return renderBorrowingBasics();
            case 'debt':
                return renderDebtTracker();
            case 'scenarios':
                return renderRateScenarios();
            default:
                return null;
        }
    };

    const questionNumber = Math.min(currentQuiz.questionIndex + 1, currentLesson.quiz.length);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBarBg, trackBackgroundStyle]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${Math.max(progressPercent, 8)}%`, backgroundColor: primaryColor },
                        ]}
                    />
                </View>
                <View style={styles.progressLegend}>
                    <ThemedText style={[styles.progressLabel, mutedTextStyle]}>
                        Unit 2 · {completedCount}/4 complete
                    </ThemedText>
                    <ThemedText style={[styles.progressLabel, mutedTextStyle]}>
                        Learning {formatCurrency(learningDollars)}
                    </ThemedText>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={[styles.lessonBadge, { backgroundColor: colors.primaryPale }]}>
                        <ThemedText style={[styles.badgeText, { color: primaryColor }]}>
                            Lesson {lessonIndex + 1} · Interest, Debt & Credit
                        </ThemedText>
                    </View>
                    <ThemedText type="title" style={styles.lessonTitle}>
                        {currentLesson.title}
                    </ThemedText>
                    <ThemedText style={[styles.lessonObjective, mutedTextStyle]}>
                        {currentLesson.objective}
                    </ThemedText>
                </View>

                {renderInteractiveSection()}

                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.cardHeader}>
                        <ThemedText type="defaultSemiBold">Quick check</ThemedText>
                        <ThemedText style={[styles.quizPrompt, mutedTextStyle]}>
                            Answer all {currentLesson.quiz.length} questions to unlock the next mechanic.
                        </ThemedText>
                    </View>

                    <View style={styles.quizMetaRow}>
                        <ThemedText style={[styles.quizMetaLabel, mutedTextStyle]}>
                            Question {questionNumber} of {currentLesson.quiz.length}
                        </ThemedText>
                    </View>

                    <ThemedText style={[styles.cardBodyText, bodyTextStyle]}>
                        {currentQuestion.prompt}
                    </ThemedText>

                    <View style={styles.answersContainer}>
                        {currentQuestion.options.map((answer, index) => {
                            const isSelected = currentQuiz.lastSelection === index;
                            let background = cardBg;
                            let border = borderColor;

                            if (isSelected && currentQuiz.isCorrect === true) {
                                border = successColor;
                                background = successColor + '15';
                            } else if (isSelected && currentQuiz.isCorrect === false) {
                                border = dangerColor;
                                background = dangerColor + '15';
                            }

                            return (
                                <TouchableOpacity
                                    key={answer}
                                    style={[styles.answerButton, { backgroundColor: background, borderColor: border }]}
                                    onPress={() => handleSelectAnswer(index)}
                                    disabled={currentQuiz.completed || currentQuiz.awaitingAdvance}
                                >
                                    <View style={[styles.answerCircle, { borderColor: border }]}>
                                        {isSelected && (
                                            <View
                                                style={[
                                                    styles.answerCircleFill,
                                                    { backgroundColor: currentQuiz.isCorrect ? successColor : dangerColor },
                                                ]}
                                            />
                                        )}
                                    </View>
                                    <ThemedText style={[styles.answerText, bodyTextStyle]}>{answer}</ThemedText>
                                    {isSelected && currentQuiz.isCorrect !== null && (
                                        <ThemedText style={styles.resultIcon}>
                                            {currentQuiz.isCorrect ? '✓' : '✗'}
                                        </ThemedText>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {currentQuiz.isCorrect !== null && (
                        <View
                            style={[
                                styles.feedbackCard,
                                {
                                    borderColor: currentQuiz.isCorrect ? successColor : dangerColor,
                                    backgroundColor: currentQuiz.isCorrect ? successColor + '15' : dangerColor + '15',
                                },
                            ]}
                        >
                            <ThemedText
                                style={[
                                    styles.feedbackTitle,
                                    { color: currentQuiz.isCorrect ? successColor : dangerColor },
                                ]}
                            >
                                {currentQuiz.isCorrect ? 'Nice!' : 'Not quite yet'}
                            </ThemedText>
                            <ThemedText style={[styles.cardBodyText, bodyTextStyle]}>
                                {currentQuiz.isCorrect
                                    ? currentQuiz.completed
                                        ? `+${formatCurrency(currentLesson.reward)} learning dollars earned.`
                                        : 'Correct. Tap “Next question” to keep going.'
                                    : 'Revisit the interactive module above, then try again.'}
                            </ThemedText>
                        </View>
                    )}

                    {unitSummaryVisible && (
                        <View style={styles.modalOverlay}>
                            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeSummaryModal} />
                            <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor }]}>
                                <ThemedText style={styles.modalTitle}>Unit complete</ThemedText>
                                <ThemedText style={[styles.modalFeature, bodyTextStyle]}>
                                    {formatCurrency(learningDollars)} learning dollars earned
                                </ThemedText>
                                <View style={styles.summarySection}>
                                    <ThemedText style={styles.summaryHeading}>Concepts mastered</ThemedText>
                                    {UNIT_LESSONS.map((lesson) => (
                                        <View key={lesson.id} style={styles.summaryRow}>
                                            <ThemedText style={styles.summaryConcept}>{lesson.title}</ThemedText>
                                            <ThemedText style={[styles.cardBodyText, bodyTextStyle]}>
                                                {lesson.objective}
                                            </ThemedText>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.summarySection}>
                                    <ThemedText style={styles.summaryHeading}>Features unlocked</ThemedText>
                                    <View style={styles.summaryFeatureList}>
                                        {(unlockedThisUnit.length > 0 ? unlockedThisUnit : ['Portfolio Overview']).map(
                                            (feature) => (
                                                <View key={feature} style={[styles.summaryFeatureChip, summaryFeatureChipStyle]}>
                                                    <ThemedText
                                                        style={[styles.summaryFeatureText, { color: bodyTextColor }]}
                                                    >
                                                        {feature}
                                                    </ThemedText>
                                                </View>
                                            )
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: primaryColor }]}
                                    onPress={closeSummaryModal}
                                >
                                    <ThemedText style={styles.modalButtonText}>Return to lessons</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {currentQuiz.awaitingAdvance && !currentQuiz.completed && (
                        <TouchableOpacity
                            style={[styles.nextQuestionButton, { backgroundColor: primaryColor }]}
                            onPress={handleAdvanceQuestion}
                        >
                            <ThemedText style={styles.nextQuestionText}>Next question ➜</ThemedText>
                        </TouchableOpacity>
                    )}

                    {currentQuiz.completed && (
                        <ThemedText style={[styles.quizMetaLabel, mutedTextStyle]}>
                            Quiz cleared — continue to unlock {currentLesson.unlock}.
                        </ThemedText>
                    )}
                </View>

                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText type="defaultSemiBold">Mini challenges</ThemedText>
                    <ChallengeRow
                        title="Choose the best loan"
                        description="Compare lower interest vs. longer terms."
                        complete={loanChallengeComplete}
                        bodyTextColor={bodyTextColor}
                    />
                    <ChallengeRow
                        title="Simulate credit card payoff"
                        description="Switch to debt sprint to minimize interest."
                        complete={debtChallengeComplete}
                        bodyTextColor={bodyTextColor}
                    />
                </View>

                {completedCount === UNIT_LESSONS.length && (
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: successColor + '15',
                                borderColor: successColor,
                            },
                        ]}
                    >
                        <ThemedText type="defaultSemiBold" style={{ color: successColor }}>
                            End-of-unit reward unlocked
                        </ThemedText>
                        <ThemedText style={[styles.cardBodyText, bodyTextStyle]}>
                            Government Bonds (5% APY) added to portfolio. Passive interest now accrues automatically.
                            Badge earned: Interest Expert.
                        </ThemedText>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        {
                            backgroundColor: continueDisabled ? borderColor : primaryColor,
                            opacity: continueDisabled ? 0.5 : 1,
                        },
                    ]}
                    disabled={continueDisabled}
                    onPress={handleContinue}
                >
                    <ThemedText style={styles.continueButtonText}>
                        {isFinalLesson
                            ? rewardClaimed
                                ? 'Unit complete'
                                : 'Finish unit'
                            : `Continue to Lesson ${lessonIndex + 2}`}
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {unlockModal.visible && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeUnlockModal} />
                    <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor }]}>
                        <ThemedText style={styles.modalTitle}>Unlocked!</ThemedText>
                        <ThemedText style={[styles.modalFeature, bodyTextStyle]}>{unlockModal.feature}</ThemedText>
                        <ThemedText style={[styles.cardBodyText, bodyTextStyle]}>
                            New mechanic added to your portfolio. Keep the streak going.
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: primaryColor }]}
                            onPress={closeUnlockModal}
                        >
                            <ThemedText style={styles.modalButtonText}>Keep learning</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ThemedView>
    );
}

type ChallengeRowProps = {
    title: string;
    description: string;
    complete: boolean;
    bodyTextColor: string;
};

function ChallengeRow({ title, description, complete, bodyTextColor }: ChallengeRowProps) {
    const badgeColor = complete ? '#22C55E' : '#94A3B8';
    return (
        <View style={styles.challengeRow}>
            <View
                style={[
                    styles.challengeBadge,
                    {
                        backgroundColor: badgeColor + '26',
                        borderColor: badgeColor,
                    },
                ]}
            >
                <ThemedText style={[styles.challengeBadgeText, { color: badgeColor }]}>
                    {complete ? 'Done' : 'Locked'}
                </ThemedText>
            </View>
            <View style={styles.challengeCopy}>
                <ThemedText type="defaultSemiBold">{title}</ThemedText>
                <ThemedText style={[styles.cardBodyText, { color: bodyTextColor }]}>{description}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 12,
    },
    progressBarBg: {
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 999,
    },
    progressLegend: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabel: {
        fontSize: 12,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 16,
        gap: 8,
    },
    lessonBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    lessonTitle: {
        fontSize: 28,
    },
    lessonObjective: {
        lineHeight: 20,
    },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    cardGroup: {
        marginBottom: 16,
        gap: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardSubtext: {
        fontSize: 12,
    },
    cardBodyText: {
        fontSize: 14,
        lineHeight: 20,
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statRow: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 12,
    },
    statBox: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
    },
    statLabel: {
        fontSize: 12,
    },
    statValue: {
        fontSize: 18,
        marginTop: 4,
    },
    meterTrack: {
        height: 10,
        borderRadius: 999,
    },
    meterFill: {
        height: '100%',
        borderRadius: 999,
    },
    meterCaption: {
        fontSize: 12,
        marginTop: 6,
    },
    controlRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    controlButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    controlButtonText: {
        fontWeight: '600',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    scoreButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreButtonText: {
        fontSize: 20,
        fontWeight: '600',
    },
    scoreValueBox: {
        flex: 1,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 12,
    },
    sectionHeader: {
        marginTop: 8,
        marginBottom: 4,
    },
    sectionCaption: {
        fontSize: 12,
    },
    loanCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    loanHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loanApr: {
        fontWeight: '600',
    },
    loanMechanic: {
        marginTop: 4,
        marginBottom: 12,
    },
    loanStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    loanLabel: {
        fontSize: 12,
    },
    loanFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bestPill: {
        marginTop: 12,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    bestPillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    feedbackCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        marginTop: 12,
    },
    feedbackTitle: {
        fontWeight: '600',
        marginBottom: 6,
    },
    toggleRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
    },
    trackerBar: {
        height: 10,
        borderRadius: 999,
        marginTop: 12,
    },
    trackerFill: {
        height: '100%',
        borderRadius: 999,
    },
    scenarioLabel: {
        marginBottom: 4,
    },
    quizPrompt: {
        fontSize: 12,
    },
    quizMetaRow: {
        marginBottom: 12,
    },
    quizMetaLabel: {
        fontSize: 12,
    },
    answersContainer: {
        gap: 12,
        marginTop: 12,
        marginBottom: 12,
    },
    answerButton: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    answerCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    answerCircleFill: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    answerText: {
        flex: 1,
    },
    resultIcon: {
        fontSize: 18,
    },
    nextQuestionButton: {
        marginTop: 8,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    nextQuestionText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    challengeRow: {
        marginTop: 12,
        flexDirection: 'row',
        gap: 12,
    },
    challengeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
    },
    challengeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    challengeCopy: {
        flex: 1,
        gap: 4,
    },
    bottomPadding: {
        height: 120,
    },
    bottomBar: {
        padding: 20,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    continueButton: {
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15,23,42,0.65)',
    },
    modalCard: {
        width: '80%',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    modalFeature: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    modalButton: {
        marginTop: 20,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    summarySection: {
        width: '100%',
        marginTop: 16,
    },
    summaryHeading: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    summaryRow: {
        marginBottom: 8,
    },
    summaryConcept: {
        fontWeight: '600',
    },
    summaryFeatureList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    summaryFeatureChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    summaryFeatureText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

