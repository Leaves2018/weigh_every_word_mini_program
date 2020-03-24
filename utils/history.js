const getHistoryListFromStorage = () => {
  var history_list = [];
  try {
    history_list = wx.getStorageSync('history_list');
  } catch (e) {
    console.warn("'history_list' is not existed. A new history_list will be created.")
    setHistoryListInStorage(history_list);
  } finally {
    return history_list;
  }
}

const setHistoryListInStorage = (history_list) => {
  wx.setStorage({
    key: 'history_list',
    data: history_list,
  })
}

const getHistoryFromStorage = headline => {
  var history = null;
  try {
    var history = wx.getStorageSync(headline);
  } catch (e) {
    console.warn(e);
  } finally {
    return history;
  }
}

const setHistoryFromStorage = (headline, history) => {
  wx.setStorage({
    key: headline,
    data: history,
  })
}

module.exports = {
  getHistoryFromStorage: getHistoryFromStorage,
  setHistoryInStorage: setHistoryInStorage,
  getHistoryListFromStorage: getHistoryFromStorage,
  setHistoryListInStorage: setHistoryFromStorage,
}
