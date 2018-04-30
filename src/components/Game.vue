<template>
  <div>
    <div v-if="loading">Loading</div>
    <div v-if="error">{{ error }}</div>
    <h1>{{ message }}</h1>
    <table align="center">
      <tr>
        <td id="cell-1" @click="handleClick(0)">{{ moves[0] }}</td>
        <td id="cell-2" @click="handleClick(1)">{{ moves[1] }}</td>
        <td id="cell-3" @click="handleClick(2)">{{ moves[2] }}</td>
      </tr>
      <tr>
        <td id="cell-4" @click="handleClick(3)">{{ moves[3] }}</td>
        <td id="cell-5" @click="handleClick(4)">{{ moves[4] }}</td>
        <td id="cell-6" @click="handleClick(5)">{{ moves[5] }}</td>
      </tr>
      <tr>
        <td id="cell-7" @click="handleClick(6)">{{ moves[6] }}</td>
        <td id="cell-8" @click="handleClick(7)">{{ moves[7] }}</td>
        <td id="cell-9" @click="handleClick(8)">{{ moves[8] }}</td>
      </tr>
    </table>
    <div>
      <button @click="resetBoard" :disabled="!canReset">Reset</button>
    </div>
    <game-invite v-if="currentState === 'NEW'" :gameId="gameId"></game-invite>
  </div>
</template>

<script>
import GameInvite from '@/components/GameInvite'

const EMPTY_BOARD = [null, null, null, null, null, null, null, null, null]
const STATES = {
  NEW: 'NEW',
  PLAYING: 'PLAYING',
  DRAW: 'DRAW',
  WIN: 'WIN',
}
const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]
const generateId = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)} // eslint-disable-line
export default {
  data: () => ({
    gameId: null,
    moves: [null, null, null, null, null, null, null, null, null],
    nextPlayer: 'x',
    invalidMove: false,
    currentState: STATES.NEW, // new, playing, draw, win
    loading: false,
    error: null,
  }),
  components: { GameInvite },
  computed: {
    canReset: function () {
      return this.currentState !== STATES.NEW
    },
    message: function () {
      let message = ''
      switch (this.currentState) {
        case STATES.NEW:
        case STATES.PLAYING:
          message = `Next player: ${this.nextPlayer}`

          if (this.invalidMove) {
            message += ' (pick another spot)'
          }
          break
        case STATES.DRAW:
          message = `It's a draw`
          break
        case STATES.WIN:
          message = `Player ${this.nextPlayer} wins!`
          break
      }
      return message
    },
  },
  created () {
    this.resetBoard()
  },
  methods: {
    resetBoard () {
      this.moves = JSON.parse(JSON.stringify(EMPTY_BOARD))
      this.nextPlayer = 'x'
      this.currentState = STATES.NEW
      this.gameId = generateId()
    },
    async handleClick (cellIndex) {
      // Do not handle click if we've won
      if (this.currentState === STATES.WIN) {
        return
      }

      // Check if space is used
      if (this.moves[cellIndex] !== null) {
        this.invalidMove = true
        return
      }

      this.invalidMove = false
      this.$set(this.moves, cellIndex, this.nextPlayer)

      // Transition fro "new" to "playing"
      if (this.currentState === STATES.NEW) {
        this.currentState = STATES.PLAYING
      }

      // Check for win (and post to API)
      if (this.checkForWinner(this.moves, this.nextPlayer)) {
        this.currentState = STATES.WIN
        await this.postGameToApi()
        return
      }

      // See if any moves are left (and post to API if it's a DRAW)
      const hasEmptySpace = ~this.moves.findIndex(space => space === null)
      if (!hasEmptySpace) {
        this.currentState = STATES.DRAW
        await this.postGameToApi()
        return
      }

      this.nextPlayer = this.nextPlayer === 'x' ? 'o' : 'x'
    },
    checkForWinner (moves, currentPlayer) {
      let hasWon = false

      WINNING_COMBOS.forEach(function (combo) {
        if (
          moves[combo[0]] === currentPlayer &&
          moves[combo[1]] === currentPlayer &&
          moves[combo[2]] === currentPlayer
        ) {
          hasWon = true
        }
      })

      return hasWon
    },
    async postGameToApi () {
      const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'http://daveratcliff.herokuapp.com'
      this.loading = true
      this.error = null
      try {
        await this.axios.post(`${API_URL}/api/games`, { moves: this.moves })
      } catch (e) {
        this.error = e.toString()
      }
      this.loading = false
    },
  },
}
</script>

<style scoped>
td {
    border: #000000 1px solid;
    width: 100px;
    height: 100px;
    text-align: center;
    font-size: 50px;
}

#cell-1 {
    border-top: none;
    border-left: none;
}

#cell-2 {
    border-top: none;
}

#cell-3 {
    border-top: none;
    border-right: none;
}

#cell-4 {
    border-left: none;
}

#cell-6 {
    border-right: none
}

#cell-7 {
    border-bottom: none;
    border-left: none;
}

#cell-8 {
    border-bottom: none;
}

#cell-9 {
    border-bottom: none;
    border-right: none;
}
</style>
