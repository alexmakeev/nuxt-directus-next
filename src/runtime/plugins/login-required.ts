import { useDirectusAuth } from '../composables/use-directus-auth'
import {
  addRouteMiddleware,
  defineNuxtPlugin,
  navigateTo,
  useRuntimeConfig,
} from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  console.log('Defining LoginRequired Plugin')
  const {
    middlewareName,
    redirectTo,
    global,
    publicPaths,
  } = useRuntimeConfig().public.directus.moduleConfig.loginRequiredMiddleware

  const {
    user, refresh
  } = useDirectusAuth({ staticToken: false })

    addRouteMiddleware(middlewareName, async (to, _from) => {
      const restricted = !publicPaths.length || !publicPaths.find((p: string) => p.endsWith('*') ? to.path.indexOf(p.substring(0,p.length-1)) === 0 : to.path === p); // TODO: support regexp wild cards

      if (!user.value) {
        await refresh();
      }
      if (!user.value && to.path !== redirectTo && restricted) {
        return navigateTo(redirectTo)
      }
    }, {
      global
    });
})
