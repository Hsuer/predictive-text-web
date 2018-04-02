import React, { Component } from 'react'
import classnames from 'classnames'
import { Icon, Modal } from 'antd'

import './index.scss'

const confirm = Modal.confirm

export default class extends Component {
  handleCreate = () => {
    if (this.props.hasEdited) {
      confirm({
        title: '您的文档还未保存，确定要离开吗?',
        content: '如果离开您的文档将不会保存',
        onOk: () => {
          this.props.createDocument()
        }
      })
      return
    }

    this.props.createDocument()
  }

  handleSelect = (index) => {
    if (this.props.hasEdited) {
      confirm({
        title: '您的文档还未保存，确定要离开吗?',
        content: '如果离开您的文档将不会保存',
        onOk: () => {
          this.props.updateSelectedIndex(index)
        }
      })
      return
    }

    this.props.updateSelectedIndex(index)
  }

  renderList = () => {
    const { documentList, selectedIndex } = this.props
    return documentList.map((item, index) => 
      this.renderItem(item.title || "未命名标题", index, index === selectedIndex)
    )
  }

  renderItem = (title, index, isActive = false) => {
    const cls = classnames({
      'comp-list-item': true,
      active: isActive,
      edited: isActive && this.props.hasEdited
    })
    return (
      <div
        className={cls}
        key={`comp-list-item${index}`}
        onClick={() => { this.handleSelect(index) }}
      >
        <Icon type="file-text" /> {title}
      </div>
    )
  }

  render() {
    return (
      <div className="comp-list">
        <div className="comp-list-create" onClick={this.handleCreate}>
          创建文档 <Icon type="plus" />
        </div>
        <div className="comp-list-group">
          {this.renderList()}
        </div>
      </div>
    )
  }
}
