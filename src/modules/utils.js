function subsets (arr) {

  /**
   * Given array of elements,  returns subsets
   * @param {Array} arr
   * @returns {Array}
   **/

  if (arr.length === 0) {

    return arr;
  }

  var curEle = arr.shift(),
      curSubset = subsets(arr);

  return [[curEle]].concat(curSubset).concat(curSubset.map(function (ele) {

    return [curEle].concat(ele);
  }));
}

module.exports = {

  subsets: subsets
};
