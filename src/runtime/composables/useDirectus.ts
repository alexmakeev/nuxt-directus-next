import { defu } from 'defu'
import type {
  ClientOptions,
  DirectusGraphqlConfig,
  DirectusRestConfig,
  RestConfig
} from '../types'
import {
  useRuntimeConfig,
  ref
} from '#imports'
import {
  authentication,
  createDirectus,
  graphql,
  rest,
  staticToken as sdkStaticToken
} from '@directus/sdk'

export const useDirectus = <T extends Object>(url?: string, options?: ClientOptions) => {
  const configUrl = useRuntimeConfig().public.directus.url

  return createDirectus<T>(url ?? configUrl, options)
}

export const useDirectusRest = <T extends Object>(config?: DirectusRestConfig) => {
  const { moduleConfigs, cookieConfigs, staticToken } = useRuntimeConfig().public.directus
  const { tokens } = useDirectusTokens()

  // TODO: add configs for oFetch once the following is fixed and released and check if `credentials: 'include'` works
  // https://github.com/directus/directus/issues/19747
  const defaultConfig: RestConfig = {
    credentials: 'include'
  }
  
  const options = defu(config, defaultConfig)
  
  const client = useDirectus<T>().with(authentication(
    cookieConfigs ? 'json' : 'cookie', {
      autoRefresh: moduleConfigs.autoRefresh,
      credentials: 'include',
      storage: useDirectusTokens()
    })).with(rest(options))

  if (config?.useStaticToken === undefined && !tokens.value?.access_token) {
    return client.with(sdkStaticToken(staticToken))
  } else if (typeof config?.useStaticToken === 'string') {
    return client.with(sdkStaticToken(config?.useStaticToken))
  } else if (config?.useStaticToken === true) {
    return client.with(sdkStaticToken(staticToken))
  }

  return client
}

export const useDirectusGraphql = <T extends Object>(config?: DirectusGraphqlConfig) => {
  const { moduleConfigs, cookieConfigs, staticToken } = useRuntimeConfig().public.directus
  const { tokens } = useDirectusTokens()

  const client = useDirectus<T>().with(authentication(
    cookieConfigs.useNuxtCookies ? 'json' : 'cookie', {
      autoRefresh: moduleConfigs.autoRefresh,
      credentials: 'include',
      storage: useDirectusTokens()
    })).with(graphql())

  if (config?.useStaticToken === undefined && !tokens.value?.access_token) {
    return client.with(sdkStaticToken(staticToken))
  } else if (typeof config?.useStaticToken === 'string') {
    return client.with(sdkStaticToken(config?.useStaticToken))
  } else if (config?.useStaticToken === true) {
    return client.with(sdkStaticToken(staticToken))
  }

  return client
}
