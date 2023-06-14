import { instrument } from './interaction.js'

const elements = {
  board: document.querySelector('#board'),
  keysRows: document.querySelector('#keys-rows'),
  keysCols: document.querySelector('#keys-cols'),
  btnMark: document.querySelector('#btn-mark'),
  boardContainer: document.querySelector('#container'),
}

const boardLength = 10

const cellSize = elements.board.clientWidth / boardLength
let board = Array.from({ length: boardLength }, () =>
  Array.from({ length: boardLength }, () => ({ state: 'empty' }))
)

const state = {
  startCell: null,
  axis: null,
  mark: 'fill',
}

const world = {
  board,
  state,
  elements
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
      if (state <= 1 / 3) row.push('0')
      else if (state <= 2 / 3) row.push('1')
      else row.push('2')
    }
    boardRawArr.push(row)
  }
  let boardRaw = boardRawArr.map(row => row.join(' ')).join('\n')

  world.board = boardRaw
    .split('\n')
    .map(row => row.split(' ').map(Number))
    .map(row =>
      row.map(cell => {
        switch (cell) {
          case 0:
            return { state: 'empty', dirty: false, error: false, }
          case 1:
            return { state: 'cross', dirty: false, error: false, }
          case 2:
            return { state: 'shouldFill', dirty: false, error: false, }
        }
      })
    )
}

const setGridCSS = () => {
  const gridTemplate = `repeat(${boardLength}, 1fr)`
  elements.board.style.gridTemplateColumns = gridTemplate
  elements.board.style.gridTemplateRows = gridTemplate
}

const initBoard = () => {
  loadBoard()
  world.board.forEach((row, i) => {
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
    elements.keysRows.append(rowList)

    const colList = document.createElement('ol')
    colList.id = `col-${i}`
    // populate clues for columns
    // parse column, and get the number of consecutive 'shouldFill' cells
    consecutive = 0
    world.board.forEach((row, j) => {
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
    elements.keysCols.append(colList)

    row.forEach((cell, j) => {
      const cellEl = document.createElement('div')
      cellEl.classList.add('cell', cell.state)
      if (cell.state == 'cross') {
        const xEl = document.createElement('div')
        cellEl.append(xEl)
        xEl.classList.add('x')
      }
      cellEl.id = `cell-${i}-${j}`
      elements.board.append(cellEl)
    })
  })
}

// check if board is solved

setGridCSS()
initBoard()

instrument(world)
