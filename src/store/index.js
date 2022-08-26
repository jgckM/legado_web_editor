import { createStore } from "vuex";
import source_json from "@/utils/bookSource.json";
export default createStore({
  state: {
    url: localStorage.getItem("url") || "",
    bookSource: [], // 临时存放所有书源
    bookItemContent: source_json, // 当前点击的书源项
    currentTab: localStorage.getItem("tabName") || "editTab",
    editTabSourceInfo: {},
    editHistory: { new: [], old: [] },
  },
  getters: {},
  mutations: {
    changeUrl(state, url) {
      state.url = url;
    },
    changeSource(state, data) {
      state.bookSource = data;
    },
    // editList Click
    changeBookItemContent(state, content) {
      state.bookItemContent = content;
      // console.log(content);
    },
    // edit Content
    changeBookItemNewContent(state, newContent) {
      state.bookItemContent[newContent.type] = newContent.value;
      // console.log(newContent);
    },
    // update editTab tabName and editTab info
    changeTabName(state, tabName) {
      state.currentTab = tabName;
      localStorage.setItem("tabName", tabName);
      if (tabName === "editTab") {
        state.editTabSourceInfo = state.bookItemContent;
      }
      console.log(tabName);
    },
    editHistory(state, history) {
      if (state.editHistory.new.length === 50) {
        state.editHistory.new.shift();
      }
      state.editHistory.new.push(history);
    },
    editHistoryUndo(state) {
      if (state.editHistory.old.length === 50) {
        state.editHistory.old.shift();
      }
      state.editHistory.old.push(state.bookItemContent);
      // state.bookItemContent = state.editHistory.new.pop();
      console.log("撤销", state.editHistory.new.pop());
    },
    clearEdit(state) {
      state.bookItemContent = {};
    },
  },
  actions: {},
  modules: {},
});
