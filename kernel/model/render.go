// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// LianDi is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//         http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

package model

import (
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
	"github.com/88250/lute/render"
	"github.com/88250/lute/util"
)

func renderSearchBlock(node *ast.Node) (ret string) {
	ast.Walk(node, func(n *ast.Node, entering bool) ast.WalkStatus {
		if (ast.NodeText == n.Type || ast.NodeLinkText == n.Type || ast.NodeBlockRefText == n.Type || ast.NodeCodeSpanContent == n.Type ||
			ast.NodeCodeBlockCode == n.Type || ast.NodeLinkTitle == n.Type || ast.NodeMathBlockContent == n.Type || ast.NodeInlineMathContent == n.Type ||
			ast.NodeYamlFrontMatterContent == n.Type) && entering {
			ret += util.BytesToStr(n.Tokens)
		}
		return ast.WalkContinue
	})
	return
}

func renderBlock(node *ast.Node) string {
	root := &ast.Node{Type: ast.NodeDocument}
	root.AppendChild(node)
	tree := &parse.Tree{Root: root, Context: &parse.Context{Option: Lute.Options}}
	renderer := render.NewHtmlRenderer(tree)
	return util.BytesToStr(renderer.Render())
}
