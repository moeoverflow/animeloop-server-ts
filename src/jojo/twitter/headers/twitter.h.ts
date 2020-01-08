export interface ITwitterConfig {
  consumer_key: string
  consumer_secret: string
  access_token: string
  access_token_secret: string
  /**
   * milliseconds: 60*1000
   */
  timeout_ms: number
}