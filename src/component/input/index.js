import React, { Component } from 'react'
import { Input, Button, Icon, Checkbox, message } from 'antd'
import moment from 'moment'
import copy from 'copy-to-clipboard'
import {
  getVocabulary,
  getPhrase,
  updateVocabulary,
  updatePhrase
} from '../../utils/api'

import './index.scss'

const { TextArea } = Input
let AUTOSAVEINTERVAL

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...this.props.document,   // 当前文档信息
      isAutoSave: true,         // 自动保存开关
      candidateList: [],        // 候选词列表
      candidatePageNo: 1,       // 候选词列表页码
      candidateTotal: 0,        // 候选词总个数
      wordFrequency: true,      // 单词频率开关
      phraseFrequency: true,    // 短语频率开关
      vocabId: 0                // 候选单词选择ID
    }
  }

  componentWillMount() {
    const { isAutoSave } = this.state
    if (isAutoSave) {
      this.startAutoSave()
    }
    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    this.killAutoSave()
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  /**
   * 切换文档
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedIndex !== this.props.selectedIndex) {
      this.setState(nextProps.document)
    }
  }

  /**
   * 监听按键
   */
  handleKeyDown = (e) => {
    const keyCode = e && e.keyCode
    if (!keyCode) return

    const { candidateList, candidatePageNo, candidateTotal } = this.state

    if (keyCode === 27) {
      this.setState({ candidateList: [], candidatePageNo: 1 })
    }

    if (candidateList && candidateList.length) {
      if (keyCode >= 49 && keyCode <= 49 + candidateList.length - 1) {
        this.handleChoose(e.keyCode - 49)

        e.preventDefault()
      }

      if (keyCode === 189) {
        if (candidatePageNo > 1) {
          this.setState({
            candidatePageNo: Math.max(1, candidatePageNo - 1)
          }, () => {
            this.handleChangeContent(this.textarea.textAreaRef)
          })
        }
        e.preventDefault()
      } else if (keyCode === 187) {
        const totalPage = Math.ceil(candidateTotal / 7)
        if (candidatePageNo < totalPage) {
          this.setState({ candidatePageNo: candidatePageNo + 1}, () => {
            this.handleChangeContent(this.textarea.textAreaRef)
          })
        }
        e.preventDefault()
      } else {
        this.setState({ candidatePageNo: 1 })
      }
    }
  }

  /**
   * 获得当前文档对象
   */
  getDocument = () => {
    const { title, content, lastUpdate } = this.state
    return { title, content, lastUpdate }
  }

  /**
   * 开关自动保存
   */
  handleAutoSave = (e) => {
    e.target.checked ?
      this.startAutoSave() :
      this.killAutoSave()

    message.success(`${e.target.checked ? '开启' : '关闭'}自动保存`)
  }

  /**
   * 开关单词频率调整
   */
  handleWordFrequency = (e) => {
    this.setState({  wordFrequency: e.target.checked })

    message.success(`${e.target.checked ? '开启' : '关闭'}单词频率调整`)
  }

  /**
   * 开关短语频率调整
   */
  handlePhraseFrequency = (e) => {
    this.setState({  phraseFrequency: e.target.checked })

    message.success(`${e.target.checked ? '开启' : '关闭'}短语频率调整`)
  }

  /**
   * 开启自动保存
   */
  startAutoSave = () => {
    AUTOSAVEINTERVAL = setInterval(() => {
      this.handleSave(true)
    }, 120000)
  }

  /**
   * 关闭自动保存
   */
  killAutoSave = () => {
    clearInterval(AUTOSAVEINTERVAL)
  }

  /**
   * 保存文档
   */
  handleSave = (isAutoSave) => {
    this.setState({
      lastUpdate: Date.now()
    }, () => {
      this.props.saveDocument(this.getDocument())
    })

    message.success(`${isAutoSave ? '文档自动' : ''}保存成功`)
  }

  /**
   * 删除文档
   */
  handleDelete = () => {
    if (this.props.selectedIndex === 0) {
      this.setState({
        title: '',
        content: '',
        lastUpdate: ''
      })
    }

    this.props.deleteDocument()
    message.success('删除成功')
  }

  /**
   * 复制文档内容
   */
  handleCopy = () => {
    copy(this.state.content)
    message.success('复制成功')
  }

  /**
   * 修改文档标题
   */
  handleChangeTitle = (e) => {
    this.setState({ title: e.target.value }, () => {
      this.props.handleEdit(this.getDocument())
    })
  }

  /**
   * 修改文档内容 (获取候选单词\短语列表)
   */
  handleChangeContent = (e) => {
    const content = e.value || e.target.value
    const { candidatePageNo } = this.state

    this.getCandidateWord(content)
    this.getCandidatePhrase(content)

    this.setState({ content }, () => {
      this.props.handleEdit(this.getDocument())
    })
  }

  /**
   * 获取候选单词
   */
  getCandidateWord = (content) => {
    const prefix = (content.match(/\w+$/) || [])[0]

    if (prefix && prefix !== '') {
      const { candidatePageNo, wordFrequency } = this.state

      getVocabulary({
        ipp: 7,
        page: candidatePageNo,
        prefix,
        user_mode: wordFrequency ? 1 : 0
      }).then((res) => {
        this.setState({
          candidateList: res.objects,
          candidateTotal: res.total
        })
      })
    } else {
      this.setState({ candidateList: [] })
    }
  }

  /**
   * 获取候选短语
   */
  getCandidatePhrase = (content) => {
    const prefix = (content.match(/\w+ $/) || [])[0]

    if (prefix && prefix !== '') {
      const { candidatePageNo, phraseFrequency } = this.state

      getPhrase({
        ipp: 7,
        page: candidatePageNo,
        prefix,
        user_mode: phraseFrequency ? 1 : 0
      }).then((res) => {
        this.setState({
          candidateList: res.objects,
          candidateTotal: res.total
        })
      })
    } else {
      this.setState({ candidateList: [] })
    }
  }

  /**
   * 输出候选词列表
   */
  renderCandidateList = () => {
    const { candidateList } = this.state
    return (candidateList || []).map((item, index) => {
      const key = `candidate_word${index}`
      return (
        <span key={key} onClick={() => this.handleChoose(index)}>
          {`${index + 1}. ${item.word}`}
        </span>
      )
    })
  }

  /**
   * 选择候选词
   */
  handleChoose = (index) => {
    const { candidateList } = this.state
    const word = candidateList && candidateList[index] && candidateList[index].word
    const chooseId = candidateList && candidateList[index] && candidateList[index].id
    const text = this.textarea.props.value

    if (!/ $/.test(text)) {
      this.handleChooseVocabulary(chooseId)
      this.setState({ vocabId: chooseId })
    } else {
      this.handleChoosePhrase({
        phraseId: chooseId,
        vocabId: this.state.vocabId
      })
    }

    const content = text.replace(/(\w+$)|(\w+ $)/, `$2${word} `)
    this.setState({
      content,
      candidateList: [],
      candidatePageNo: 1
    }, () => {
      this.getCandidatePhrase(content)
    })
  }

  /**
   * 单词选择回调
   */
  handleChooseVocabulary = (vocabId) => {
    updateVocabulary({ vocabId })
  }

  /**
   * 短语选择回调
   */
  handleChoosePhrase = ({ phraseId, vocabId }) => {
    updatePhrase({ phraseId, vocabId })
  }

  render() {
    const { title, content, lastUpdate, isAutoSave,
      wordFrequency, phraseFrequency } = this.state

    return (
      <div className="comp-input">
        <div className="comp-input-setting">
          <span className="comp-input-setting__title">
            <Icon type="setting" /> 个性化设置
          </span>
          <Checkbox
            onChange={this.handleWordFrequency}
            defaultChecked={wordFrequency}
          >
            单词频率调整
          </Checkbox>
          <Checkbox
            onChange={this.handlePhraseFrequency}
            defaultChecked={phraseFrequency}
          >
            短语频率调整
          </Checkbox>
          <Checkbox
            onChange={this.handleAutoSave}
            defaultChecked={isAutoSave}
          >
            自动保存
          </Checkbox>
        </div>
        <div className="comp-input-title">
          <Input
            placeholder="请输入标题"
            value={ title }
            onChange={this.handleChangeTitle}
          />
        </div>
        <div className="comp-input-content">
          <TextArea
            value={ content }
            onChange={this.handleChangeContent}
            ref={(e) => this.textarea = e}
          />
        </div>
        <div className="comp-input-candidate_list">
          {this.renderCandidateList()}
        </div>
        <div className="comp-input-autosave">
          <Icon type="clock-circle-o" />
          {lastUpdate === '' ?
            " 文档暂未保存" : ` 已于 ${moment(lastUpdate).format('YYYY-MM-DD H:mm:ss')} 保存`
          }
        </div>
        <div className="comp-input-opt">
          <Button type="dashed" onClick={this.handleCopy}>
            <Icon type="copy" /> 复制到剪切板
          </Button>
          <Button type="dashed" onClick={this.handleDelete}>
            <Icon type="delete" /> 删除
          </Button>
          <Button type="primary" onClick={() => this.handleSave(false)}>
            <Icon type="save" /> 保存
          </Button>
        </div>
      </div>
    )
  }
}