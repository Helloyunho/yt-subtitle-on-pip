//
//  SafariWebExtensionHandler.swift
//  Shared (Extension)
//
//  Created by Helloyunho on 3/10/24.
//

import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        context.completeRequest(returningItems: nil, completionHandler: nil)
    }

}
