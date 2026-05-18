// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// Copyright @ 2018-present xiejiahe. All rights reserved.
// See https://github.com/liuzi6612/nav

import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { $t } from 'src/locale'
import { NzMessageService } from 'ng-zorro-antd/message'
import { setAuthCode, getAuthCode, removeAuthCode, setToken } from 'src/utils/user'
import { getUserInfo, updateUserInfo, verifyToken } from 'src/api'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzSpinModule } from 'ng-zorro-antd/spin'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
  ],
  selector: 'auth',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class AuthComponent {
  readonly $t = $t
  submitting: boolean = false
  isPermission = !!getAuthCode()
  authCode = ''
  url = ''

  constructor(private message: NzMessageService) {}

  ngOnInit() {
    if (this.isPermission) {
      this.getUserInfo()
    }
  }

  private async getUserInfo(params?: any) {
    this.submitting = true
    return getUserInfo(params)
      .then((res: any) => {
        if (typeof res.data?.data?.url === 'string') {
          this.isPermission = true
          this.url = res.data.data.url
        }
        return res
      })
      .finally(() => {
        this.submitting = false
      })
  }

  handleSubmitAuthCode() {
    if (this.submitting || !this.authCode) {
      return
    }

    // GitHub PAT 登录（Fork/Pages 用户免 nav3 授权码）
    if (this.authCode.startsWith('github_pat_') || this.authCode.startsWith('ghp_')) {
      this.submitting = true
      verifyToken(this.authCode)
        .then(() => {
          setToken(this.authCode)
          setAuthCode(this.authCode)
          window.location.reload()
        })
        .catch(() => {
          this.message.error('GitHub Token 无效或已过期')
        })
        .finally(() => {
          this.submitting = false
        })
      return
    }

    this.getUserInfo({ code: this.authCode }).then(() => {
      setAuthCode(this.authCode)
      window.location.reload()
    })
  }

  handleSave() {
    this.submitting = true
    updateUserInfo({
      url: this.url,
    })
      .then(() => {
        this.getUserInfo()
        this.message.success(this.$t('_saveSuccess'))
      })
      .finally(() => {
        this.submitting = false
      })
  }

  logoutAuthCode() {
    removeAuthCode()
    window.location.reload()
  }
}
