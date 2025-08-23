class Row {
  columnsNum = 8
  constructor(columnsNum) {
    this.cells = Array(columnsNum).fill(0)
    this.prev = null
    this.next = null
  }
}

const mine = 'mine'
const minesNumberMap = { 8: 9, 12: 15, 16: 40, 30: 60 }
const cellSizeMap = { 8: '74px', 12: '54px', 16: '40px' }
const levels = { 0: [8, 8], 1: [12, 12], 2: [16, 16], 3: [16, 30] }

let openCellsCount = 0
let cellsToOpenNumber = levels[0][0] * levels[0][1] - minesNumberMap[8]
let fallingIconsInterval

const linkRows = (rowsNum, grid) => {
  for (let i = 0; i < rowsNum; i++) {
    if (i !== 0) grid[i].prev = grid[i - 1]
    if (i !== rowsNum - 1) grid[i].next = grid[i + 1]
  }
  return grid
}

const generateLinkedGrid = (rowsNum, columnsNum) => {
  const grid = Array(rowsNum).fill(null).map(() => new Row(columnsNum))
  return linkRows(rowsNum, grid)
}

const generateRowCells = grid => grid.map(row => row.cells)
const getRandomIndex = base => Math.floor(Math.random() * base)

const setMine = (rows, rowsNum, columnsNum) => {
  const rowIndex = getRandomIndex(rowsNum)
  const cellIndex = getRandomIndex(columnsNum)
  if (rows[rowIndex][cellIndex] === mine) setMine(rows, rowsNum, columnsNum)
  else rows[rowIndex][cellIndex] = mine
}

const arrangeMines = (rows, rowsNum, columnsNum) => {
  const minesNumber = minesNumberMap[columnsNum]
  for (let i = 0; i < minesNumber; i++) setMine(rows, rowsNum, columnsNum)
}

const isHint = cellContent => !isNaN(cellContent)

const fillAdjacentCells = (cells, i) => {
  if (isHint(cells[i - 1])) cells[i - 1]++
  if (isHint(cells[i + 1])) cells[i + 1]++
}

const fillAdjacentRows = (cells, i) => {
  if (isHint(cells[i])) cells[i]++
  fillAdjacentCells(cells, i)
}

const calculateHints = head => {
  let current = head[0]
  while (current !== null) {
    current.cells.forEach((cell, i, cells) => {
      if (cell === mine) {
        fillAdjacentCells(cells, i)
        if (current.prev) fillAdjacentRows(current.prev.cells, i)
        if (current.next) fillAdjacentRows(current.next.cells, i)
      }
    })
    current = current.next
  }
}

const renderBoard = rows => {
	const gridContainer = document.querySelector('.grid-container')
  const gridElement = document.createElement('div')
  gridElement.className = 'grid'
  gridContainer.appendChild(gridElement)

	rows.forEach((row, i) => {
		const rowElement = document.createElement('div')
		rowElement.className = 'row'
		rowElement.dataset.index = i

		row.forEach(cell => {
			const getCellContent = () => {
				if (cell === 0) return ''
				if (cell === mine) return '💩'
				return cell
			}

			const cellElement = document.createElement('button')
			const cellCoverElement = document.createElement('span')
			cellElement.className = 'cell'
			cellElement.setAttribute('type', 'button')
			cellElement.textContent = getCellContent()
			cellCoverElement.className = 'cell-cover'
			cellElement.appendChild(cellCoverElement)
			rowElement.appendChild(cellElement)
		})
    gridElement.appendChild(rowElement)
	})
}

const removeFlowAnimation = () => {
  const flowsContainer = document.querySelector('.flows')
  if (flowsContainer.classList.contains('flow')) {
    flowsContainer.classList.add('flush')
    setTimeout(() => {
      flowsContainer.classList.remove('flow')
      flowsContainer.classList.remove('flush')
    }, 1500)
  }
}

const showDialog = (type, delay) => {
  const dialog = document.querySelector(`.${type}-dialog`)
  const dialogCloseButton = dialog.querySelector('.dialog-close-button')
  const restartGameButton = dialog.querySelector('.restart-button')

  dialogCloseButton.addEventListener('click', () => {
    removeFlowAnimation()
    dialog.close()
  })
  restartGameButton.addEventListener('click', () => {
    restartGame([])
    dialog.close()
  })

  setTimeout(() => dialog.showModal(), delay ?? 750)
  updateStatsOnFinish(type)
}

const getRandomItemFromArray = items => items[Math.floor(Math.random() * items.length)]

const checkIfWin = () => {
  openCellsCount++
  if (openCellsCount === cellsToOpenNumber) {
    const flowsContainer = document.querySelector('.flows')
    const iconsNumber = 25
    const icons = ['🧻', '🌟', '💩', '✨', '🧻', '🌟', '💩', '✨']

    function createFallingIcon() {
      const iconElement = document.createElement('div')
      iconElement.classList.add('icon-fall')
      iconElement.textContent = getRandomItemFromArray(icons)
      flowsContainer.appendChild(iconElement)

      const startX = Math.random() * window.innerWidth
      const duration = (Math.random() * 3 + 2).toFixed(2)
      const size = Math.random() * 20 + 60

      iconElement.style.left = `${startX}px`
      iconElement.style.animationDuration = `${duration}s`
      iconElement.style.fontSize = `${size}px`

      setTimeout(() => iconElement.remove(), duration * 1000)
    }

    fallingIconsInterval = setInterval(() => {
      if (flowsContainer.childElementCount < iconsNumber) createFallingIcon()
    }, 500)

    showDialog(WIN_TYPE)
  }
}

const clearSiblingCells = (cellIndex, rowCells, rowIndex, allRows) => {
  const currentCell = rowCells[cellIndex]
  if (!currentCell || !currentCell?.children?.length) return

  currentCell.children[0].remove()
  checkIfWin()

  const prevCellIndex = cellIndex - 1
  const nextCellIndex = cellIndex + 1
  const prevRowIndex = rowIndex - 1
  const nextRowIndex = rowIndex + 1

  if (!currentCell.textContent) {
    // Covers current row
    if (prevCellIndex >= 0) {
      const prevCell = rowCells[prevCellIndex]
      if (prevCell.textContent !== '💩') clearSiblingCells(prevCellIndex, rowCells, rowIndex, allRows)
    }
    if (nextCellIndex < rowCells.length) {
      const nextCell = rowCells[nextCellIndex]
      if (nextCell.textContent !== '💩') clearSiblingCells(nextCellIndex, rowCells, rowIndex, allRows)
    }

    // Covers rows to the top
    if (prevRowIndex >= 0) {
      const prevRow = allRows[prevRowIndex]
      const prevRowCells = [...prevRow.children]
      clearSiblingCells(cellIndex, prevRowCells, prevRowIndex, allRows)
      clearSiblingCells(cellIndex - 1, prevRowCells, prevRowIndex, allRows)
      clearSiblingCells(cellIndex + 1, prevRowCells, prevRowIndex, allRows)
    }

    // Covers rows to the bottom
    if (nextRowIndex < allRows.length) {
      const nextRow = allRows[nextRowIndex]
      const nextRowCells = [...nextRow.children]
      clearSiblingCells(cellIndex, nextRowCells, nextRowIndex, allRows)
      clearSiblingCells(cellIndex - 1, nextRowCells, nextRowIndex, allRows)
      clearSiblingCells(cellIndex + 1, nextRowCells, nextRowIndex, allRows)
    }
  }
}

const clearAdjacentEmptyCells = (row, cell) => {
  const grid = document.querySelector('.grid')
  const allRows = [...grid.children]
  const rowIndex = Number(row.dataset.index)
  const rowCells = [...row.children]
  const cellIndex = rowCells.indexOf(cell)
  clearSiblingCells(cellIndex, rowCells, rowIndex, allRows)
}

const handleLeftMouseClick = cellCover => {
  const currentRow = cellCover.closest('.row')
  const currentCell = cellCover.closest('.cell')

  if (currentCell.textContent === '') {
    clearAdjacentEmptyCells(currentRow, currentCell)
    return
  }
  if (currentCell.textContent === '💩') {
    const flowsContainer = document.querySelector('.flows')
    Array.from(flowsContainer.children).forEach(flow => {
      const duration = (Math.random() * 5 + 1).toFixed(2)
      const timingFunctions = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']
      const timing = getRandomItemFromArray(timingFunctions)
      flow.setAttribute('style', `--flowDurationRandom: ${duration}; --flowTiming: ${timing}`)
    })
    flowsContainer.classList.add('flow')
    showDialog(LOSE_TYPE, 1000)
  }

  cellCover.remove()

  if (isHint(currentCell.textContent)) checkIfWin()
}

const handleRightMouseClick = cellCover => {
	switch (cellCover.dataset.coverState) {
		case 'poop-mark':
			cellCover.textContent = '🤷'
			cellCover.classList.add('cover-question-mark')
			cellCover.classList.remove('cover-poop-mark')
			cellCover.dataset.coverState = 'question-mark'
			break
		case 'question-mark':
			cellCover.textContent = ''
			cellCover.classList.remove('cover-poop-mark', 'cover-question-mark')
			delete cellCover.dataset.coverState
			break
		default:
			cellCover.textContent = '🧻'
			cellCover.classList.add('cover-poop-mark')
			cellCover.classList.remove('cover-question-mark')
			cellCover.dataset.coverState = 'poop-mark'
	}
}

const handleCellClick = event => {
	const cellCover = event.target
	cellCover.oncontextmenu = () => {
		event.preventDefault()
		event.stopPropagation()
		return false
	}

	if (!cellCover.closest('.cell-cover')) return
  if (event.button === 0 && !cellCover.dataset.coverState) handleLeftMouseClick(cellCover)
	if (event.button === 2) handleRightMouseClick(cellCover)

  clickCount++
  if (clickCount === 1) sendGameStarted()
}

const startGame = (rowsNum, columnsNum) => {
  if (!rowsNum || !columnsNum) {
    const boardSize = getLsItem(LS_BOARD_SIZE_KEY)
    if (boardSize) {
      rowsNum = boardSize.rowsNum
      columnsNum = boardSize.columnsNum
    } else {
      rowsNum = columnsNum = 8
    }
  }
  setLsItem(LS_BOARD_SIZE_KEY, { rowsNum, columnsNum })
  clickCount = 0
  openCellsCount = 0
  cellsToOpenNumber = rowsNum * columnsNum - minesNumberMap[columnsNum]
  const grid = generateLinkedGrid(rowsNum, columnsNum)
  const rows = generateRowCells(grid)
  clearInterval(fallingIconsInterval)
  removeFlowAnimation()
  arrangeMines(rows, rowsNum, columnsNum)
  calculateHints(grid)
  renderBoard(rows)
  const cellsList = [...document.querySelectorAll('.cell')]
  cellsList.forEach(cell => cell.addEventListener('mouseup', handleCellClick))
  document.querySelector('.grid').style.setProperty('--cell-size', cellSizeMap[rowsNum])
}

const menuButton = document.querySelector('.menu-button')
const menuDialog = document.querySelector('.menu-dialog')
const menuDialogCloseButton = menuDialog.querySelector('.dialog-close-button')
menuButton.addEventListener('click', () => menuDialog.showModal())
menuDialogCloseButton.addEventListener('click', () => menuDialog.close())

const restartGame = level => {
  const [rowsNum, columnsNum] = level
  document.querySelector('.grid').remove()
  startGame(rowsNum, columnsNum)
  menuDialog.close()
}

const levelButtons = menuDialog.querySelectorAll('.level-button')
levelButtons.forEach((button, index) => {
  button.addEventListener('click', () => restartGame(levels[index]))
})

startGame()
