export const useQuestions = () => {
  const [state, setState] = useState({
    questions: [],
    currentIndex: 0,
    isLoading: false,
    error: null
  });

  const fetchQuestions = async (language, count) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const questions = await generateQuestions(language, count);
      setState({
        questions,
        currentIndex: 0,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      throw error;
    }
  };

  const reset = () => setState({
    questions: [],
    currentIndex: 0,
    isLoading: false,
    error: null
  });

  return {
    ...state,
    fetchQuestions,
    setCurrentIndex: (index) => setState(prev => ({ ...prev, currentIndex: index })),
    resetQuestions: reset
  };
};