export function instrument({ board, state, elements }) {
  elements.board.addEventListener('pointerdown', e => {
    e.preventDefault()
    // only allow left click
    // this needs some work though.
    if (e.button != 0) return
    const target = getTarget(e.target)
    if (target == elements.boardContainer) return
    state.startCell = target
    handleCell(target)
    checkBoard(target)
  })

  elements.board.addEventListener('pointermove', e => {
    e.preventDefault()
    const target = getTarget(e.target)
    if (target == elements.boardContainer) return
    if (state.startCell == null) return
    if (state.startCell == target) return

    const startCellId = state.startCell.id.split('-').slice(1).map(Number)
    const targetCellId = target.id.split('-').slice(1).map(Number)
    const startCell = { x: startCellId[0], y: startCellId[1] }
    const targetCell = { x: targetCellId[0], y: targetCellId[1] }

    if (state.axis == null) {
      const axis = startCell.x == targetCell.x ? 'x' : 'y'
      state.axis = axis
    }

    if (state.axis == 'x') {
      if (startCell.x != targetCell.x) return
    } else {
      if (startCell.y != targetCell.y) return
    }

    handleCell(target)
    checkBoard(target)
  })

  const clearBoardState = () => {
    state.startCell = null
    state.axis = null
    // state.mark = 'fill'
  }

  window.addEventListener('pointerup', e => {
    e.preventDefault()
    clearBoardState()
  })

  elements.btnMark.addEventListener('click', e => {
    e.preventDefault()
    toggleMark()
  })

  window.addEventListener('keydown', e => {
    if (e.key == ' ') {
      e.preventDefault()
      toggleMark()
    }
  })

  const toggleMark = () => {
    if (state.mark == 'fill') {
      state.mark = 'cross'
      elements.btnMark.textContent = '[]'
    } else {
      state.mark = 'fill'
      elements.btnMark.textContent = 'X'
    }
  }

  const getTarget = target => {
    // this is a bit hacky, but it works for now
    // the issue is that when moving the pointer, the target can be the grid,
    // which is the board container.
    if (target.classList.contains('cell')) return target
    else return target.parentElement
  }

  const getXY = id => {
    const [x, y] = id.split('-').slice(1).map(Number)
    return { x, y }
  }

  const handleCell = target => {
    const { x, y } = getXY(target.id)
    if (board[x][y].dirty) return
    const checkCell = (x, y) => {
      if (board[x][y].state == 'shouldFill' && state.mark == 'fill') return true
      else if (board[x][y].state == 'empty' && state.mark == 'cross')
        return true
      else return false
    }
    if (checkCell(x, y)) {
      target.classList.replace(board[x][y].state, state.mark)
      board[x][y].state = state.mark
      if (state.mark == 'cross') {
        const xEl = document.createElement('div')
        target.append(xEl)
        xEl.classList.add('x')
      }
    } else if (board[x][y].state == 'empty') {
      board[x][y].state = 'cross'
      board[x][y].error = true
      target.classList.replace('empty', 'cross')
      target.classList.add('error')
    } else if (board[x][y].state == 'shouldFill') {
      board[x][y].state = 'fill'
      board[x][y].error = true
      target.classList.replace('shouldFill', 'fill')
      target.classList.add('error')
    }
    board[x][y].dirty = true
  }

  const checkBoard = (cell) => {
    // this should also check if the row/col is solved
    const { x, y } = getXY(cell.id)

    // fill row with crosses if all cells are filled
    if (!board[x].some(cell => cell.state == 'shouldFill')) {
      for (let i = 0; i < board[x].length; i++) {
        if (board[x][i].state == 'empty') {
          const cellEl = document.querySelector(`#cell-${x}-${i}`)
          cellEl.classList.replace('empty', 'cross')
          const xEl = document.createElement('div')
          xEl.classList.add('x')
          cellEl.append(xEl)
        }
      }
      const row = document.getElementById(`row-${x}`)
      row.classList.add('solved')
    }

    // fill col with crosses if all cells are filled
    if (!board.some(row => row[y].state == 'shouldFill')) {
      for (let i = 0; i < board.length; i++) {
        if (board[i][y].state == 'empty') {
          const cellEl = document.querySelector(`#cell-${i}-${y}`)
          cellEl.classList.replace('empty', 'cross')
          const xEl = document.createElement('div')
          xEl.classList.add('x')
          cellEl.append(xEl)
        }
      }
      const col = document.getElementById(`col-${y}`)
      col.classList.add('solved')
    }

    let solved = true
    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell.state == 'shouldFill' && !cell.dirty) solved = false
      })
    })
    if (solved) {
      console.log('solved!')
      elements.board.classList.add('solved')
      elements.board.replaceChildren('solved')
    }
  }
}
