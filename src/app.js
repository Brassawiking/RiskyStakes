import { repeat, text } from '../feppla/feppla.js'
/** @type {{ value: string, color: string }[]}} */
const tableNumbers = []
tableNumbers.push({
  value: '0',
  color: 'green'
})
for (let i = 1 ; i <= 36 ; ++i) {
  let colorOffset = 0
  if (i > 10) {
    colorOffset += 1
  }
  if (i > 18) {
    colorOffset += 1
  }
  if (i > 28) {
    colorOffset += 1
  }

  tableNumbers.push({
    value: String(i),
    color: (i + colorOffset) % 2 ? 'red' : 'black'
  })
}
tableNumbers.push({
  value: '00',
  color: 'green'
})

/** @type {{ value: number }[]}} */
const playerChips = [
  { value: 100 },
  { value: 200 },
  { value: 300 },
  { value: 400 },
  { value: 500 },
  { value: 9000 },
]

//@ts-ignore
document.querySelector('#app').innerHTML = `
  <div class="player-stash">
    ${repeat(() => playerChips, (chip) => `
      <div class="chip player" tabindex="-1">
        ${chip.value} 
      </div>
    `)}
  </div>

  <div class="table">
    ${repeat(() => tableNumbers, (tableNumber) => `
      <div class="number ${tableNumber.color}">
        ${text(() => tableNumber.value)}
      </div>
    `)}
  </div>
`
