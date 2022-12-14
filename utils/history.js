const getHistoryListFromStorage = () => {
  var history_list = [];
  try {
    history_list = wx.getStorageSync('history_list');
    if (typeof (history_list) === "string") {
      throw "'history_list' is not existed. A new history_list will be created.";
    }
  } catch (e) {
    console.warn(e);
    history_list = [];
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

// 如果本地存储找不到以headline为key的记录，会返回空字符串
const getHistoryFromStorage = headline => {
  var history = null;
  try {
    var history = wx.getStorageSync(headline);
    if (typeof (history) === "string") {
      throw "History '{$headline}' is not existed.";
    }
  } catch (e) {
    console.warn(e);
  } finally {
    return history;
  }
}

const setHistoryInStorage = (headline, history) => {
  wx.setStorage({
    key: headline,
    data: history,
  })
}

const getHistoryListDoneFromStorage = () => {
  var history_done_list = [];
  try {
    history_done_list = wx.getStorageSync('history_done_list');
    if (typeof (history_done_list) === "string") {
      throw "'history_done_list' is not existed. A new history_done_list will be created.";
    }
  } catch (e) {
    console.warn(e);
    history_done_list = [];
    setHistoryListDoneInStorage(history_done_list);
  } finally {
    return history_done_list;
  }
}

const setHistoryListDoneInStorage = (history_done_list) => {
  wx.setStorage({
    key: 'history_done_list',
    data: history_done_list,
  })
}

module.exports = {
  getHistoryFromStorage: getHistoryFromStorage,
  setHistoryInStorage: setHistoryInStorage,
  getHistoryListFromStorage: getHistoryListFromStorage,
  setHistoryListInStorage: setHistoryListInStorage,
  getHistoryListDoneFromStorage: getHistoryListDoneFromStorage,
  setHistoryListDoneInStorage: setHistoryListDoneInStorage,
}
