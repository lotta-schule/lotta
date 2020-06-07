import '@testing-library/jest-dom';

// stub out window.getSelection
// window.getSelection isn't in jsdom
// https://github.com/tmpvar/jsdom/issues/937
// @ts-ignore
window.getSelection = function() { 
  return { 
    addRange: function() {}, 
    removeAllRanges:function() {} 
  };
};
