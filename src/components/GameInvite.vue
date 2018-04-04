<template>
  <div>
    <input type="text" :disabled="sending" v-model="smsNumber"><button :disabled="sending || !smsNumber.length" @click="sendSms">{{ sending ? 'Sending' : 'Send' }}</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    gameId: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    sending: false,
    smsNumber: '',
    message: null,
  }),
  methods: {
    async sendSms () {
      // TODO -- Validate data

      this.sending = true
      this.message = null

      try {
        const response = await this.callApi(this.smsNumber, this.gameId)
        console.log(response)
        this.message = `Successfully sent to ${this.smsNumber}`
        this.smsNumber = ''
      } catch (e) {
        console.error(e)
        this.message = `Error sending: ${e}`
      }
      this.sending = false
    },
    async callApi (to, gameId) {
      const url = `${window.location.origin}/.netlify/functions/send-game-invite`
      const response = await axios.post(url, { to, gameId })
      return response.data
    },
  },
}
</script>

<style scoped>
</style>
