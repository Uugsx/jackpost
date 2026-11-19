const Test = (__jackpostTestResults, chai) => async (description, callback) => {
  try {
    await callback();
    __jackpostTestResults.addResult({ description, status: 'pass' });
  } catch (error) {
    if (error instanceof chai.AssertionError) {
      const { message, actual, expected } = error;
      __jackpostTestResults.addResult({
        description,
        status: 'fail',
        error: message,
        actual,
        expected,
        stack: error.stack || null,
        errorName: error.name || 'AssertionError'
      });
    } else {
      __jackpostTestResults.addResult({
        description,
        status: 'fail',
        error: error.message || 'An unexpected error occurred.',
        stack: error.stack || null,
        errorName: error.name || 'Error'
      });
    }
  }
};

module.exports = Test;
