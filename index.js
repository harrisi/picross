const boardContainer = document.querySelector('#container')
const boardElement = document.querySelector('#board')
const keysRows = document.querySelector('#keys-rows')
const keysCols = document.querySelector('#keys-cols')
const btnMark = document.querySelector('#btn-mark')

const boardLength = 5
const cellSize = boardElement.clientWidth / boardLength
let board = Array.from({ length: boardLength },
  () => Array.from({ length: boardLength },
    () => ({ state: 'empty'})))

const boardState = {
  startCell: null,
  axis: null,
  mark: 'fill',
}

const getXY = (id) => {
  const [x, y] = id.split('-').slice(1).map(Number)
  return { x, y }
}

const checkCell = (x, y) => {
  if (board[x][y].state == 'shouldFill' && boardState.mark == 'fill') return true
  else if (board[x][y].state == 'empty' && boardState.mark == 'cross') return true
  else return false
}

const getTarget = (target) => {
  if (target.classList.contains('cell')) return target
  else return target.parentElement
}

boardElement.addEventListener('pointerdown', (e) => {
  e.preventDefault()
  // only allow left click
  // this needs some work though.
  if (e.button != 0) return
  const target = getTarget(e.target)
  if (target == boardContainer) return
  boardState.startCell = target
  const { x, y } = getXY(target.id)
  if (board[x][y].dirty) return
  if (checkCell(x, y)) {
    target.classList.replace(board[x][y].state, boardState.mark)
    if (boardState.mark == 'cross') {
      const xEl = document.createElement('div')
      xEl.classList.add('x')
      target.append(xEl)
    }
  } else if (board[x][y].state == 'empty'){
    target.classList.replace('empty', 'cross')
    target.classList.add('error')
  } else if (board[x][y].state == 'shouldFill') {
    target.classList.replace('shouldFill', 'fill')
    target.classList.add('error')
  }
  board[x][y].dirty = true
  checkBoard()
})

boardElement.addEventListener('pointermove', (e) => {
  e.preventDefault()
  const target = getTarget(e.target)
  if (target == boardContainer) return
  if (boardState.startCell == null) return
  if (boardState.startCell == target) return

  const startCellId = boardState.startCell.id.split('-').slice(1).map(Number)
  const targetCellId = target.id.split('-').slice(1).map(Number)
  const startCell = { x: startCellId[0], y: startCellId[1] }
  const targetCell = { x: targetCellId[0], y: targetCellId[1] }

  const { x, y } = getXY(target.id)

  if (boardState.axis == null) {
    const axis = startCell.x == targetCell.x ? 'x' : 'y'
    boardState.axis = axis
  }

  if (board[x][y].dirty) return

  if (boardState.axis == 'x') {
    if (startCell.x != targetCell.x) return
  } else {
    if (startCell.y != targetCell.y) return
  }

  // this should actually draw based on the axis, so if axis == 'x' then draw a horizontal line
  // regardless of where on the y axis the target is. Same for axis == 'y' but vertical.
  if (checkCell(x, y)) {
    target.classList.replace(board[x][y].state, boardState.mark)
    if (boardState.mark == 'cross') {
      const xEl = document.createElement('div')
      xEl.classList.add('x')
      target.append(xEl)
    }
  } else if (board[x][y].state == 'empty'){
    target.classList.replace('empty', 'cross')
    target.classList.add('error')
  } else if (board[x][y].state == 'shouldFill') {
    target.classList.replace('shouldFill', 'fill')
    target.classList.add('error')
  }
  board[x][y].dirty = true
  checkBoard()
})

window.addEventListener('pointerup', (e) => {
  e.preventDefault()
  clearBoardState()
})

btnMark.addEventListener('click', (e) => {
  e.preventDefault()
  if (boardState.mark == 'fill') {
    boardState.mark = 'cross'
    btnMark.textContent = '[]'
  } else {
    boardState.mark = 'fill'
    btnMark.textContent = 'X'
  }
})

clearBoardState = () => {
  boardState.startCell = null
  boardState.axis = null
  // boardState.mark = 'fill'
}

const loadBoard = () => {
  // fetch board from server/fs, but for now it's random
  // const boardRaw = fetch('http://localhost:3000/board')
  //   .then(res => res.json())
  //   .then(data => data)
  //   .catch(err => console.log(err))

  let boardRawArr = []
  for (let i = 0; i < boardLength; i++) {
    let row = []
    for (let j = 0; j < boardLength; j++) {
      const state = Math.random()
      if (state <= 1/3) row.push('0')
      else if (state <= 2/3) row.push('1')
      else row.push('2')
    }
    boardRawArr.push(row)
  }
  let boardRaw = boardRawArr.map(row => row.join(' ')).join('\n')

  board = boardRaw
    .split("\n")
    .map((row) => row.split(" ").map(Number))
    .map((row) =>
      row.map((cell) => {
        switch (cell) {
          case 0:
            return { state: "empty", dirty: false, }
          case 1:
            return { state: "cross", dirty: false, }
          case 2:
            return { state: "shouldFill", dirty: false, }
        }
      })
    )
}

const initBoard = () => {
  loadBoard()
  board.forEach((row, i) => {
    const rowList = document.createElement('ol')
    rowList.id = `row-${i}`
    // populate clues for rows
    // parse row, and get the number of consecutive 'shouldFill' cells
    let consecutive = 0
    row.forEach((cell, j) => {
      const rowClue = document.createElement('li')
      rowClue.classList.add('clue')
      if (cell.state == 'shouldFill') consecutive++
      else if (consecutive > 0) {
        rowClue.append(consecutive)
        consecutive = 0
      }
      if (j == row.length - 1 && consecutive > 0) rowClue.append(consecutive)
      // only add to list if there's a clue
      if (rowClue.innerHTML != '') rowList.append(rowClue)
    })
    keysRows.append(rowList)

    const colList = document.createElement('ol')
    colList.id = `col-${i}`
    // populate clues for columns
    // parse column, and get the number of consecutive 'shouldFill' cells
    consecutive = 0
    board.forEach((row, j) => {
      const colClue = document.createElement('li')
      colClue.classList.add('clue')
      if (row[i].state == 'shouldFill') consecutive++
      else if (consecutive > 0) {
        colClue.append(consecutive)
        consecutive = 0
      }
      if (j == row.length - 1 && consecutive > 0) colClue.append(consecutive)
      // only add to list if there's a clue
      if (colClue.innerHTML != '') colList.append(colClue)
    })
    keysCols.append(colList)

    row.forEach((cell, j) => {
      const cellEl = document.createElement('div')
      cellEl.classList.add('cell', cell.state)
      if (cell.state == 'cross') {
        const xEl = document.createElement('div')
        xEl.classList.add('x')
        cellEl.append(xEl)
      }
      cellEl.id = `cell-${i}-${j}`
      boardElement.append(cellEl)
    })
  })
}

// check if board is solved
const checkBoard = () => {
  // this should also check if the row/col is solved
  let solved = true
  board.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.state == 'shouldFill' && !cell.dirty) solved = false
    })
  })
  if (solved) {
    console.log('solved!')
    boardElement.classList.add('solved')
    boardElement.replaceChildren('solved')
  }

  // board.forEach((row, i) => {
  //   if (!row.includes('shouldFill')) {
  //     const rowList = document.getElementById(`row-${i}`)
  //     rowList.classList.add('solved')
  //     // need to cross out the rest of the row
  //     row.forEach((cell, j) => {
  //       if (cell.state == 'empty') {
  //         const cellEl = document.querySelector(`#cell-${i}-${j}`)
  //         cellEl.classList.replace('empty', 'cross')
  //         const xEl = document.createElement('div')
  //         xEl.classList.add('x')
  //         cellEl.append(xEl)
  //       }
  //     })
  //   }
  // })

  // // check columns
  // for (let i = 0; i < boardLength; i++) {
  //   let col = []
  //   board.forEach((row, j) => {
  //     col.push(row[i])
  //   })
  //   if (!col.includes('shouldFill')) {
  //     const colList = document.getElementById(`col-${i}`)
  //     colList.classList.add('solved')
  //     // need to cross out the rest of the column
  //     col.forEach((cell, j) => {
  //       if (cell.state == 'empty') {
  //         const cellEl = document.querySelector(`#cell-${j}-${i}`)
  //         cellEl.classList.replace('empty', 'cross')
  //         const xEl = document.createElement('div')
  //         xEl.classList.add('x')
  //         cellEl.append(xEl)
  //       }
  //     })
  //   }
  // }
}

initBoard()