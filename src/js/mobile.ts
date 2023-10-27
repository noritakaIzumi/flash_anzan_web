import {
    AppUpdate,
    AppUpdateAvailability,
    FlexibleUpdateInstallStatus,
    type FlexibleUpdateState,
} from '@capawesome/capacitor-app-update'
import { button, htmlElements } from './dom/htmlElement.js'

export async function checkMobileAppUpdate(): Promise<void> {
    if (import.meta.env.MODE !== 'mobile') {
        return
    }

    const completeFlexibleUpdate = async (): Promise<void> => {
        await AppUpdate.completeFlexibleUpdate()
    }

    const startFlexibleUpdate = async (): Promise<void> => {
        const result = await AppUpdate.getAppUpdateInfo()
        if (result.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
            return
        }
        if (result.flexibleUpdateAllowed ?? false) {
            AppUpdate.addListener('onFlexibleUpdateStateChange', (state: FlexibleUpdateState) => {
                if (state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
                    button.completeFlexibleUpdate.addEventListener('click', () => {
                        void completeFlexibleUpdate()
                    })
                    htmlElements.inAppUpdateNotification.classList.remove('d-none')
                }
            })
            await AppUpdate.startFlexibleUpdate()
        }
    }

    await startFlexibleUpdate()
}
