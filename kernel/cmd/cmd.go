// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// LianDi is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//         http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

package cmd

import (
	"github.com/88250/liandi/kernel/model"
	"gopkg.in/olahol/melody.v1"
)

type Cmd interface {
	Name() string
	Id() float64
	Exec()
}

type BaseCmd struct {
	id          float64
	param       map[string]interface{}
	session     *melody.Session
	PushPayload *model.Result
}

func (cmd *BaseCmd) Id() float64 {
	return cmd.id
}

func (cmd *BaseCmd) Push() {
	cmd.PushPayload.Callback = cmd.param["callback"]
	sid, _ := cmd.session.Get("id")
	cmd.PushPayload.SessionId = sid.(string)
	model.PushEvent(cmd.PushPayload)
}

func NewCommand(cmdStr string, cmdId float64, param map[string]interface{}, session *melody.Session) (ret Cmd) {
	baseCmd := &BaseCmd{id: cmdId, param: param, session: session}
	switch cmdStr {
	case "closews":
		ret = &closews{baseCmd}
	case "mount":
		ret = &mount{baseCmd}
	case "mountremote":
		ret = &mountremote{baseCmd}
	case "unmount":
		ret = &unmount{baseCmd}
	case "ls":
		ret = &ls{baseCmd}
	case "get":
		ret = &get{baseCmd}
	case "put":
		ret = &put{baseCmd}
	case "create":
		ret = &create{baseCmd}
	case "search":
		ret = &search{baseCmd}
	case "searchblock":
		ret = &searchblock{baseCmd}
	case "rename":
		ret = &rename{baseCmd}
	case "mkdir":
		ret = &mkdir{baseCmd}
	case "remove":
		ret = &remove{baseCmd}
	case "getconf":
		ret = &getconf{baseCmd}
	case "setlang":
		ret = &setlang{baseCmd}
	case "settheme":
		ret = &settheme{baseCmd}
	case "setmd":
		ret = &setmd{baseCmd}
	case "checkupdate":
		ret = &checkupdate{baseCmd}
	case "setimage":
		ret = &setimage{baseCmd}
	case "exec":
		ret = &exec{baseCmd}
	case "getblock":
		ret = &getblock{baseCmd}
	case "graph":
		ret = &graph{baseCmd}
	case "treegraph":
		ret = &treegraph{baseCmd}
	case "exportmd":
		ret = &exportmd{baseCmd}
	case "getblockinfo":
		ret = &getblockinfo{baseCmd}
	}

	pushMode := model.PushModeSingleSelf
	if pushModeParam := param["pushMode"]; nil != pushModeParam {
		pushMode = model.PushMode(pushModeParam.(float64))
	}
	reloadPushMode := model.PushModeSingleSelf
	if reloadPushModeParam := param["reloadPushMode"]; nil != reloadPushModeParam {
		reloadPushMode = model.PushMode(reloadPushModeParam.(float64))
	}
	baseCmd.PushPayload = model.NewCmdResult(ret.Name(), cmdId, pushMode, reloadPushMode)
	sid, _ := baseCmd.session.Get("id")
	baseCmd.PushPayload.SessionId = sid.(string)
	return
}

func Exec(cmd Cmd) {
	go func() {
		defer model.Recover()
		cmd.Exec()
	}()
}

func pushReloadEvent(payload *model.Result, data map[string]interface{}) {
	reload := model.NewCmdResult("reload", 0, payload.PushMode, payload.ReloadPushMode)
	reload.SessionId = payload.SessionId
	data["eventSource"] = payload.Cmd
	data["eventSourceReqId"] = payload.ReqId
	reload.Data = data
	model.PushEvent(reload)
}
