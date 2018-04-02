import React, { Component } from 'react'
import { Layout, Icon } from 'antd'
import List from '../../component/list'
import Input from '../../component/input'
import { getLocalStorage, setLocalStorage } from '../../utils'
import { isEqual } from 'lodash'

import './index.scss'

const { Header, Content, Footer } = Layout

export default class extends Component {

  constructor() {
    super()
    this.state = {
      documentList: [{
        title: '',
        content: '',
        lastUpdate: ''
      }],
      selectedIndex: 0,
      hasEdited: false
    }
  }

  componentWillMount() {
    const documentList = JSON.parse(getLocalStorage("ptDocuments") || '{}')
    const selectedIndex = parseInt(getLocalStorage("ptSelectedIndex"), 10) || 0
    if (documentList && documentList.length) {
      this.setState({
        documentList,
        selectedIndex
      })
    } else {
      this.initDocumentList()
      this.initSelectedIndex()
    }
  }

  /**
   * 初始化文档选择索引
   */
  initSelectedIndex = () => {
    this.updateSelectedIndex(0)
  }

  /**
   * 初始化文档
   */
  initDocumentList = () => {
    this.updateDocumentList([{
      title: '',
      content: '',
      lastUpdate: ''
    }])
  }

  /**
   * 更新文档选择索引
   */
  updateSelectedIndex = (selectedIndex) => {
    this.setState({ selectedIndex, hasEdited: false }, () => {
      setLocalStorage("ptSelectedIndex", JSON.stringify(this.state.selectedIndex))
    })
  }

  /**
   * 更新文档列表
   */
  updateDocumentList = (documentList) => {
    this.setState({ documentList, hasEdited: false }, () => {
      setLocalStorage("ptDocuments", JSON.stringify(this.state.documentList))
    })
  }

  /**
   * 创建文档
   */
  createDocument = () => {
    const { documentList } = this.state
    const newDocumentList = documentList.slice()
    newDocumentList.push({
      title: '',
      content: '',
      lastUpdate: ''
    })

    this.updateDocumentList(newDocumentList)
    this.updateSelectedIndex(newDocumentList.length - 1 || 0)
  }

  /**
   * 删除文档
   */
  deleteDocument = (index = this.state.selectedIndex) => {
    const { documentList } = this.state

    // 如果只剩余一篇文档时，则初始化文档
    if (documentList.length === 1) {
      this.initDocumentList()
      return
    }

    const newDocumentList = documentList.slice()
    newDocumentList.splice(index, 1)

    this.updateDocumentList(newDocumentList)
    this.updateSelectedIndex(Math.max(0, index - 1))
  }

  /**
   * 保存文档
   */
  saveDocument = (document, index = this.state.selectedIndex) => {
    const { documentList } = this.state
    const newDocumentList = documentList.slice()
    newDocumentList.splice(index, 1, document)
    
    this.updateDocumentList(newDocumentList)
  }

  /**
   * 判断文档是否更改
   */
  handleEdit = (newDocument) => {
    const { documentList, selectedIndex } = this.state
    const storeDocument = documentList[selectedIndex]
    this.setState({
      hasEdited: !isEqual(newDocument, storeDocument)
    })
  }

  render() {
    const { documentList, selectedIndex, hasEdited } = this.state

    return (
      <div className="container">
        <Layout className="comp-layout">
          <Header className="comp-layout-header">
            <div className="comp-layout-logo">
              <Icon type="edit" /> 英文写作助手
            </div>
          </Header>
          <Content className="comp-layout-content">
            <List
              documentList={documentList}
              selectedIndex={selectedIndex}
              createDocument={this.createDocument}
              updateSelectedIndex={this.updateSelectedIndex}
              hasEdited={hasEdited}
            />
            <Input
              document={documentList[selectedIndex]}
              selectedIndex={selectedIndex}
              handleEdit={this.handleEdit}
              saveDocument={this.saveDocument}
              deleteDocument={this.deleteDocument}
            />
          </Content>
          <Footer className="comp-layout-footer">
            Predictive Text ©2018 Created by Jeffry Lu
          </Footer>
        </Layout>
      </div>
    )
  }
}
