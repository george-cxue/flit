export type LearningProgressState = {
    learningDollars: number;
};

const progressState: LearningProgressState = {
    learningDollars: 0,
};

type Listener = (state: LearningProgressState) => void;

const listeners = new Set<Listener>();

const notifyListeners = () => {
    const snapshot = { ...progressState };
    listeners.forEach((listener) => listener(snapshot));
};

export const getLearningProgress = (): LearningProgressState => ({ ...progressState });

export const setLearningDollarsProgress = (value: number) => {
    if (progressState.learningDollars === value) {
        return;
    }
    progressState.learningDollars = value;
    notifyListeners();
};

export const resetLearningProgress = () => {
    progressState.learningDollars = 0;
    notifyListeners();
};

export const subscribeLearningProgress = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

