import { ref, repeat, text, compareArrays } from '../feppla/feppla.js'

/** @typedef {{ value: number, owner: string, state?: string }} chip */

/** @type {{ value: string, color: string, chips: chip[] }[]}} */
const tableNumbers = []

tableNumbers.push({
  value: '0',
  color: 'green',
  chips: []
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
    color: (i + colorOffset) % 2 ? 'red' : 'black',
    chips: []
  })
}

tableNumbers.push({
  value: '00',
  color: 'green',
  chips: []
})


/** @type {chip[]}} */
let playerChips = [
  { value: 100, owner: 'player' },
  { value: 200, owner: 'player' },
  { value: 300, owner: 'player' },
  { value: 400, owner: 'player' },
  { value: 500, owner: 'player' },
]

let match = 1

const placeOpponent = () => {
  const opponentPlacements = tableNumbers.map((_, index) => index).toSorted(() => 0.5 - Math.random())

  /** @type {chip[]}} */
  let opponentChips = []

  for (let i = 0 ; i < 3 + Math.floor(match / 5) ; ++i) {
    opponentChips.push({
      value: 100 * (i + match), 
      owner: 'timmy'
    })
  }

  let i = 0
  while (opponentChips.length) {
    tableNumbers[opponentPlacements[i]].chips.push(/** @type {chip} */(opponentChips.shift()))
    i++
  }
}

placeOpponent()

/** @type {{ type: string, value?: number, name: string, payout: number }[]}} */
const bets = [
  { type: 'even', name: 'Even', payout: 1 },
  { type: 'odd', name: 'Odd', payout: 1 },
  { type: 'red', name: 'Red', payout: 1 },
  { type: 'black', name: 'Black', payout: 1 },
  { type: 'green', name: 'Green', payout: 3 },
  { type: 'half', value: 0, name: '1 to 18', payout: 1 },
  { type: 'half', value: 1, name: '19 to 36', payout: 1 },
  { type: 'dozen', value: 0, name: '1st 12', payout: 2 },
  { type: 'dozen', value: 1, name: '2nd 12', payout: 2 },
  { type: 'dozen', value: 2, name: '3rd 12', payout: 2 },
  { type: 'column', value: 0, name: '1st Column', payout: 2 },
  { type: 'column', value: 1, name: '2nd Column', payout: 2 },
  { type: 'column', value: 2, name: '3rd Column', payout: 2 },
]

const betIndexToPosition = [
  'top',
  'right',
  'left',
  'bottom'
]

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time))
const shuffleBets = () => bets.toSorted(() => 0.5 - Math.random()).slice(0, 4)
let currentBets = shuffleBets()
let winningBet = null
let spinningWheel = false

const soundEffects = {
  winningBet: new Audio('https://opengameart.org/sites/default/files/_coin_pickup.mp3'), // https://opengameart.org/content/quest-for-stoken-sounds
  shuffle: new Audio('https://opengameart.org/sites/default/files/audio_preview/spinning.ogg.mp3'), // https://opengameart.org/content/spinning-wheel-0
  payout: new Audio('https://opengameart.org/sites/default/files/audio_preview/coinsplash.ogg.mp3'), // https://opengameart.org/content/coin-splash
  contestWinner: new Audio('https://opengameart.org/sites/default/files/untitled_7.mp3'), // https://opengameart.org/content/boom-effect-sound
  placement: new Audio('https://opengameart.org/sites/default/files/audio_preview/1_Coins_0.ogg.mp3') //https://opengameart.org/content/coins-sounds

}

const playSound = (/** @type {string}} */ name) => {
  const sfx = soundEffects[name]
  sfx.currentTime = 0
  sfx.play()
}

let additionalTurnsPerMatch = 5
let turns = additionalTurnsPerMatch
let placementsPerTurn = 5
let placements = placementsPerTurn

/** @type {chip | null}} */
let selectedPlayerChip = null 

//@ts-ignore
document.querySelector('#app').innerHTML = `
  <div class="left-side">
    <div class="wheel" ${ref()
      .on('click', async () => {
        if (spinningWheel) return
        spinningWheel = true

        playSound('winningBet')
        winningBet = currentBets[Math.floor(Math.random() * 4)]
        await wait(1000)

        for (const tableNumber of tableNumbers) {
          const isWinningNumber = () => {
            switch (winningBet.type) {
              case 'even': return +tableNumber.value > 0 && !(+tableNumber.value % 2)
              case 'odd': return +tableNumber.value > 0 && +tableNumber.value % 2
              case 'red': return tableNumber.color === 'red'
              case 'black': return tableNumber.color === 'black'
              case 'green': return tableNumber.color === 'green'
              case 'half': return +tableNumber.value >= 1 + 18 * winningBet.value && +tableNumber.value <= 18 * (winningBet.value + 1)
              case 'dozen': return +tableNumber.value >= 1 + 12 * winningBet.value && +tableNumber.value <= 12 * (winningBet.value + 1)
              case 'column': return +tableNumber.value >= 1 && +tableNumber.value <= 36 && (+tableNumber.value - 1) % 3 === winningBet.value
            }
          }

          if (tableNumber.chips.length === 2) {
            const chipA = tableNumber.chips[0]
            const chipB = tableNumber.chips[1]
            const contestedResult = Math.random() * (chipA.value + chipB.value) - chipA.value

            const handleResult = async (/** @type {chip}} */ winningChip, /** @type {chip}} */ losingChip) => {
              playSound('contestWinner')
              winningChip.state = 'winner'

              losingChip.value -= winningChip.value
              if (losingChip.value <= 0) {
                losingChip.state = 'lost'
              }

              await wait(500)

              winningChip.state = ''
              if (losingChip.state === 'lost') {
                tableNumber.chips = [winningChip]
              } else {
                losingChip.state = ''
              }

              await wait(500)
            }

            if (contestedResult < 0) {
              await handleResult(chipA, chipB)
            } else {
              await handleResult(chipB, chipA)
            }
          }

          if (isWinningNumber() && tableNumber.chips.length === 1) {
            let payout = 100 * winningBet.payout
            for (const chip of tableNumber.chips) {
              playSound('payout')
              chip.state = 'payout'
              chip.value += payout
              await wait(500)
              chip.state = ''
            }
          }
        }
        winningBet = null

        const playersRemaining = new Set()
        for (const tableNumber of tableNumbers) {
          for (const chip of tableNumber.chips) {
            playersRemaining.add(chip.owner)
          }
        }

        turns -= 1
        placements = placementsPerTurn

        await wait(300)
        playSound('shuffle')
        currentBets = shuffleBets()
        await wait(100)
        currentBets = shuffleBets()
        await wait(100)
        currentBets = shuffleBets()
        await wait(100)
        currentBets = shuffleBets()
        await wait(100)
        currentBets = shuffleBets()
        await wait(100)
        currentBets = shuffleBets()
        await wait(100)
        currentBets = shuffleBets()

        spinningWheel = false

        if (!playersRemaining.has('timmy')) {
          match++
          turns += additionalTurnsPerMatch
          placeOpponent()
        } else if (turns <= 0) {
          alert('You lost =(')
        }
      })
    }>
      ${repeat(
        () => currentBets, 
        (bet) => `
          <div ${ref()
            .property('className', () => `pie ${bet.type} ${betIndexToPosition[currentBets.indexOf(bet)]}`)
            .class('winner', () => bet === winningBet)
          }>
            <div class="payout">
              ${bet.name}
              <div style="font-weight: 200;">
                +${bet.payout}00
              </div>
            </div>
          </div>
        `
      )}
    </div>

    <hr style="width: 100%;"/>
    
    <div style="color: #fff; text-align: center;">
      Match: ${text(() => match)}
    </div>
    <div style="color: #fff; text-align: center;">
      Turns: ${text(() => turns)}
    </div>
    <div style="color: #fff; text-align: center;">
      Bet placements: ${text(() => placements)}
    </div>
    
    <hr style="width: 100%;"/>

    <div class="player-stash">
      ${repeat(() => playerChips.slice(), Chip, undefined, compareArrays)}
    </div>

  </div>

  <div class="table">
    ${repeat(() => tableNumbers, (tableNumber) => `
      <div class="number ${tableNumber.color}" ${ref()
        .class('contested', () => tableNumber.chips.length >= 2)
        .on('click', () => {
          if (placements <= 0) return
          if (!selectedPlayerChip) return
          if (tableNumber.chips.find(x => x.owner === 'player')) return

          playerChips = playerChips.filter(x => x !== selectedPlayerChip)
          for (const tableNumber of tableNumbers) {
            tableNumber.chips = tableNumber.chips.filter(x => x !== selectedPlayerChip)
          }

          tableNumber.chips.push(selectedPlayerChip)
          placements--
          selectedPlayerChip = null
          playSound('placement')
        })
      }>
        <span class="text">${tableNumber.value}</span>
        ${repeat(() => tableNumber.chips.slice(), Chip, (chip) => chip.owner, compareArrays)}
      </div>
    `)}
  </div>
`
/**
 * @param {chip} chip
 */
function Chip(chip) {
  return `
    <div class="chip ${chip.owner}" ${ref()
      .class('payout', () => chip.state === 'payout')
      .class('winner', () => chip.state === 'winner')
      .class('lost', () => chip.state === 'lost')
      .class('selected', () => chip === selectedPlayerChip)
      .on('click', () => {
        if (chip.owner !== 'player') return
        if (placements <= 0) return

        selectedPlayerChip = selectedPlayerChip !== chip ? chip : null
      })
    }>
      ${text(() => chip.value >= 10000 ? `${chip.value / 1000}K` : chip.value)}
    </div>
  `
}
