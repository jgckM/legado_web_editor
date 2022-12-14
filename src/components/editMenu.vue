<template>
  <div class="menu">
    <div>
      <edit-loading v-if="isShow"></edit-loading>
      <edit-warn
        :text="warnText"
        :is-show="warnShow"
        @changeShow="changeShow"
      ></edit-warn>
      <edit-success
        v-if="successShow"
        :isShow="successShow"
        @changeShow="changeSuccessShow"
        :text="successText"
      ></edit-success>
    </div>
    <button @click="push" title="Ctrl+P">⇈推送源 <span>Ctrl+P</span></button>
    <button @click="pull" title="Shift+P">⇊拉取源 <span>Shift+P</span></button>
    <button @click="conver" title="Ctrl+E">⋙生成源<span>Ctrl+E</span></button>
    <button @click="clearEdit" title="Shift+C">
      ✗清空表单<span>Shift+C</span>
    </button>
    <button @click="undo" title="Ctrl+Z">↶撤销操作<span>Ctrl+Z</span></button>
    <button @click="redo" title="Shift+R">↷重做操作<span>Shift+R</span></button>
    <button @click="debug" title="Ctrl+Enter">
      ⇏调试源 <span>Ctrl+Enter</span>
    </button>
    <button @click="saveSource" title="Ctrl+S">
      ✓保存源<span>Ctrl+S</span>
    </button>
  </div>
</template>

<script>
import { http } from "@/utils/http";
import { onMounted, ref } from "vue";
import store from "@/store";

import editLoading from "@/components/message/editLoading";
import editWarn from "@/components/message/editWarn";
import editSuccess from "@/components/message/editSuccess";

export default {
  components: { editLoading, editWarn, editSuccess },
  setup() {
    const isShow = ref(false); // loading
    const warnShow = ref(false); // warn
    const successText = ref(""); // successText
    const successShow = ref(false); // success
    const warnText = ref(""); // warnText

    // warnShow
    const changeShow = (bool) => {
      warnShow.value = bool;
    };
    // successShow
    const changeSuccessShow = (bool) => {
      console.log(bool);
      successShow.value = bool;
    };

    const pull = () => {
      isShow.value = true;
      http("getBookSources")
        .then((res) => {
          store.commit("changeTabName", "editList");
          store.commit("changeSource", res.data);
          isShow.value = false;
          successText.value = `成功拉取${res.data.length}条源`;
          successShow.value = true;
        })
        .catch((err) => {
          console.log(err);
          isShow.value = false;
          warnText.value =
            " 请求发生了错误，请检查你的后端地址，填写是否正确，或者 阅读APP\n确认开启web服务";
          warnShow.value = true;
        });
    };

    const push = () => {
      successText.value = "正在推送中";
      successShow.value = true;
      isShow.value = true;
      http("saveBookSources", store.state.bookSource)
        .then((json) => {
          if (json.isSuccess) {
            let okData = json.data;
            if (Array.isArray(okData)) {
              let failMsg = ``;
              if (store.state.bookSource.length > okData.length) {
                store.state.bookSource.forEach((item) => {
                  if (
                    !okData.find((x) => x.bookSourceUrl === item.bookSourceUrl)
                  ) {
                    console.log(item.bookSourceUrl);
                  }
                });
                failMsg = "\n推送失败的源将用红色字体标注!";
              }
              successText.value = `批量推送源到「阅读3.0APP」\n共计: ${
                store.state.bookSource.length
              } 条\n成功: ${okData.length} 条\n失败: ${
                store.state.bookSource.length - okData.length
              } 条${failMsg}`;
              successShow.value = true;
            } else {
              successText.value = `批量推送源到「阅读3.0APP」成功!\n共计: ${store.state.bookSource.length} 条`;
              successShow.value = true;
            }
          } else {
            // alert(`批量推送源失败!\nErrorMsg: ${json.errorMsg}`);
            warnText.value = `批量推送源失败!\nErrorMsg: ${json.errorMsg}`;
            warnShow.value = true;
          }
          isShow.value = false;
        })
        .catch((err) => {
          console.log(err);
          isShow.value = false;
          warnShow.value = true;
          warnText.value = `请求发生了错误，请检查你的后端地址，填写是否正确，或者 阅读APP\n确认开启web服务`;
        });
    };

    const conver = () => {
      store.commit("changeEidtTabSourceInfo");
      store.commit("changeTabName", "editTab");
    };

    const undo = () => {
      store.commit("editHistoryUndo");
    };

    const clearEdit = () => {
      store.commit("clearEdit");
      console.log("已清除");
      successText.value = "已清除";
      successShow.value = true;
    };

    const redo = () => {
      store.commit("clearEdit");
      store.commit("clearAllHistory");
      successText.value = "已清除所有历史记录";
      successShow.value = true;
    };

    const saveSource = () => {
      if (
        store.state.bookItemContent.bookSourceUrl !== "" &&
        store.state.bookItemContent.bookSourceType !== "" &&
        store.state.bookItemContent.bookSourceName !== ""
      ) {
        http("saveBookSources", store.state.bookItemContent).then((res) => {
          if (res.isSuccess) {
            successText.value = `源《${store.state.bookItemContent.bookSourceName}》已成功保存到「阅读3.0APP」`;
            successShow.value = true;
          } else {
            warnText.value = `源《${store.state.bookItemContent.bookSourceName}》保存失败!\nErrorMsg: ${res.errorMsg}`;
            warnShow.value = true;
          }
        });
      } else {
        warnText.value = `请检查你的 源域名 源名称 源类型 <必填>项是否全部填写`;
        warnShow.value = true;
      }
    };

    const debug = () => {
      isShow.value = true;
      store.commit("deBugMsgClear");
      store.commit("changeTabName", "editDebug");
      http("saveBookSources", store.state.bookItemContent).then((res) => {
        console.log(res);
        let wsUrl;

        if (localStorage.getItem("url") === null) {
          wsUrl =
            location.host.replace(/\d+$/, (port) => parseInt(port) + 1) +
            `/bookSourceDebug`;
        } else {
          let url = localStorage.getItem("url");
          wsUrl =
            url.replace(/\d+$/, (port) => parseInt(port) + 1) +
            `/bookSourceDebug`;
        }
        console.log(wsUrl);

        const socket = new WebSocket(`ws://` + wsUrl);
        let sKey;
        if (store.state.bookItemContent.ruleSearch.checkKeyWord) {
          sKey = store.state.bookItemContent.ruleSearch.checkKeyWord;
          console.log(sKey, "-------- bookItemContent");
        } else if (store.state.searchKey) {
          sKey = store.state.searchKey;
          console.log(sKey, "----------- searchKey");
        } else {
          sKey = "我的";
          console.log(sKey, "-------------- sKey");
        }
        socket.onopen = () => {
          socket.send(
            `{"tag":"${store.state.bookItemContent.bookSourceUrl}", "key":"${sKey}"}`
          );
        };
        socket.onmessage = (msg) => {
          store.commit("changeDeBugMsg", msg.data);
        };
        socket.onclose = () => {
          isShow.value = false;
          successText.value = "调试已关闭！";
          successShow.value = true;
          store.commit("changeDeBugMsg", "调试已关闭！");
        };
      });
    };
    onMounted(() => {
      document.onkeydown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          debug();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          saveSource();
          e.preventDefault();
        }
        if (e.shiftKey && e.key === "R") {
          redo();
        }
        if (e.shiftKey && e.key === "C") {
          clearEdit();
        }
        if (e.ctrlKey && e.key === "e") {
          conver();
          e.preventDefault();
        }
        if (e.shiftKey && e.key === "P") {
          pull();
        }
        if (e.ctrlKey && e.key === "p") {
          push();
          e.preventDefault();
        }
      };
    });

    return {
      debug,
      push,
      pull,
      clearEdit,
      isShow,
      changeShow,
      warnShow,
      successText,
      changeSuccessShow,
      successShow,
      undo,
      redo,
      conver,
      warnText,
      saveSource,
    };
  },
};
</script>

<style>
.menu {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
<style lang="scss" scoped>
button {
  width: 100px;
  height: 50px;
  margin: 5px;
  outline: none;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  box-sizing: border-box;
  border: #333333 solid 1px;
  background-color: transparent;
  transition: all 0.3s ease;
  overflow: hidden;
  span {
    display: inline-block;
    transform: translateY(20px);
    opacity: 0;
    font-size: 12px;
    transition: all 0.3s ease;
  }

  &:hover {
    color: #ffffff;
    background-color: gray;
    span {
      transform: translateY(0);
      opacity: 1;
    }
  }
}
</style>
