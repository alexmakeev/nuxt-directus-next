import { useDirectusAuth } from '../composables/use-directus-auth'
import {
  addRouteMiddleware,
  defineNuxtPlugin,
  navigateTo,
  useRuntimeConfig,
} from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
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
        try { // TODO: Implement server auth-handler proxy to give code 200 even if no user logged in.
          await refresh();
        } catch (e) {
          console.log('User not logged in.')
        }
      }
      if (!user.value && to.path !== redirectTo && restricted) {
        return navigateTo(redirectTo)
      }
    }, {
      global
    });
})
