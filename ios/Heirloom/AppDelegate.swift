import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Initialize the main window
        window = UIWindow(frame: UIScreen.main.bounds)
        
        // Set the root view controller to our main view controller
        window?.rootViewController = UINavigationController(rootViewController: HomeViewController())
        
        // Make the window visible
        window?.makeKeyAndVisible()
        
        return true
    }
}