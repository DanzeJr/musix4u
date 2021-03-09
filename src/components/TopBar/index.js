// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsxImportSource @emotion/react */
import React from 'react'
import { css, } from '@emotion/react'

const Topbar = () => (
  <div
    className="Topbar"
    css={css`
      position: absolute;
      top: 0;
      height: 50px;
      background: #070707;
      left: 200px;
      width: calc(100% - 200px);
      padding: 20px;
    `}
  ></div>
)

export default Topbar
