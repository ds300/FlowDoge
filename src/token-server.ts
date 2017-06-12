import { env } from "process"
import * as express from "express"
import fetch from "node-fetch"
import * as qs from "query-string"
import { Record, Map } from "immutable"

if (!env.PORT) {
  throw new Error("no PORT environment variable found")
}
if (!env.CLIENT_SECRET) {
  throw new Error("no CLIENT_SECRET variable found ")
}
if (!env.CLIENT_ID) {
  throw new Error("no CLIENT_ID variable found ")
}
if (!env.REDIRECT_URI) {
  throw new Error("no REDIRECT_URI variable found ")
}

const app = express()

interface AccessToken {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

const ServiceStateRecord = Record({
  accessTokens: Map<string, AccessToken>(),
})

class ServiceState extends ServiceStateRecord {
  saveAccessToken(state: string, token: AccessToken): this {
    return this.set("accessTokens", this.accessTokens.set(state, token))
  }
  removeAccessToken(state: string): this {
    return this.set("accessTokens", this.accessTokens.remove(state))
  }
}

let serviceState: ServiceState = new ServiceState()

app.get("/token", (req, res) => {
  const { state } = req.query
  if (typeof state === "string" && state.match(/[a-z0-9]{32}/i)) {
    const accessToken = serviceState.accessTokens.get(state)
    if (accessToken) {
      res.status(200)
      res.header("Content-type", "application/json")
      res.end(JSON.stringify(accessToken))
      serviceState = serviceState.removeAccessToken(state)
      return
    }
  }
  /* tslint:disable-next-line */
  console.log("/token bad state", state)
  res.status(400)
  res.end()
})

app.get("/login", (req, res) => {
  const { state, code } = req.query as {
    state: string | undefined
    code: string | undefined
  }

  if (!(typeof state === "string" && typeof code === "string")) {
    /* tslint:disable-next-line */
    console.log("/login bad params", req.params)
    res.status(400)
    res.end()
    return
  }

  fetch("https://api.flowdock.com/oauth/token", {
    method: "POST",
    body: qs.stringify({
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
      code,
      redirect_uri: env.REDIRECT_URI,
      grant_type: "authorization_code",
    }),
    headers: {
      Accept: "application/json",
    },
  })
    .then(response => {
      if (response.status === 200) {
        response
          .text()
          .then(text => {
            /* tslint:disable-next-line */
            console.error(text)

            serviceState = serviceState.saveAccessToken(state, JSON.parse(text))

            res.end("Thanks for logging into Flowdoge. You can close this now.")
          })
          .catch(err => {
            /* tslint:disable-next-line */
            console.error(err)
            res.end("Couldn't parse response from Flowdock :/")
          })
      } else {
        res.end(
          "Errmmm, not sure what happened, but that didn't work. Maybe try again?",
        )
        response.text().then(text => {
          /* tslint:disable-next-line */
          console.log("bad response", response.status, text)
        })
      }
    })
    .catch(e => {
      /* tslint:disable-next-line */
      console.error(e)
    })
})

/* tslint:disable-next-line */
app.listen(env.PORT, () => console.log("got bound on port " + env.PORT))
