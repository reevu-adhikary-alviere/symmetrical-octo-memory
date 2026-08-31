---
title: "Error Codes"
description: "HTTP response codes, the validation block, and the full Alviere error code reference"
---

# Error Codes

Alviere employs standardized HTTP response codes to convey the outcome of API requests. Each response code provides insights into whether a request was successful, requires redirection, has client-induced errors, or encountered server-side issues.

### **Categories of HTTP Response Codes:**

* **2xx (Success)**: The request was processed successfully and contains no errors.

* **3xx (Redirection)**: Additional actions are needed to finalize the request.

* **4xx (Client Error)**: The request contains inaccuracies, often stemming from the client side.

* **5xx (Server Error)**: These indicate issues within our infrastructure and are uncommon.

  * **Urgent Action Required**: Should you encounter any 5xx errors, please reach out to us without delay at <ops@alviere.com>.

### **Common HTTP error codes**

| Code    | Text           | Description                                                                          |
| ------- | -------------- | ------------------------------------------------------------------------------------ |
| 201     | OK             | The request was executed successfully.                                               |
| 400     | Bad Request    | The request was inappropriate, likely due to missing parameters.                     |
| 401     | Not authorized | The request wasn't authorized or had an invalid or missing API Token.                |
| 403     | Forbidden      | The provided API Token lacks the required permissions.                               |
| 404     | Not Found      | The sought-after resource isn't available.                                           |
| 409     | Conflict       | The request is in conflict with another, possibly due to identical idempotency keys. |
| 500-504 | Server Error   | There was an unexpected issue on our side.                                           |

### **API error codes**

In addition to the status code, some response bodies will also contain a `Validation` section, indicating the specific outcome of your request. This encompasses:

* **Result**: Specifies if the request was "Accepted" or "Denied".

* **Error code**: A unique identifier linked to a recognisable request error.

* **Description**: Elaborates on the particular error encountered.

If the request has no issues, these fields remain unpopulated.

#### Sample response

```json
{
  "validation": {
    "result": "REJECTED",
    "error_code": "500012",
    "error_description": "Payment method is invalid"
  }
}
```

#### List of error codes (HTTP 400 responses)

| Error Code | Description                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| 100011     | The system couldn't process the encrypted data                                         |
| 100012     | The encrypted data's endpoint is incorrect or corrupted                                |
| 100013     | The system can't decode the encrypted data at the endpoint                             |
| 100014     | The decrypted data at the endpoint is incorrect or unusable                            |
| 100015     | The endpoint for the decrypted data is wrong                                           |
| 100016     | The specified version or destination endpoint is incorrect                             |
| 100017     | The ongoing operation was stopped                                                      |
| 100018     | Either client\_id and client\_secret or authorization token should be provided         |
| 100019     | client\_id and client\_secret can't coexist with authorization token                   |
| 100020     | authorization token provided without an account uuid                                   |
| 100021     | Could not generate authorization token                                                 |
| 100022     | Could not parse authorization token                                                    |
| 100023     | Could not parse jwt account uuid                                                       |
| 100024     | Could not retrieve account                                                             |
| 100025     | Invalid jwt                                                                            |
| 100026     | Could not generate auth response                                                       |
| 100027     | Could not get public certificate                                                       |
| 100028     | Invalid account ownership                                                              |
| 100029     | Account is deleted                                                                     |
| 100030     | Account is not consumer or business                                                    |
| 100300     | Invalid request payload                                                                |
| 100301     | Invalid request payload field                                                          |
| 100302     | Invalid path parameter                                                                 |
| 100303     | Invalid header                                                                         |
| 100304     | Invalid query parameter                                                                |
| 100305     | Invalid Authorization token                                                            |
| 100306     | Authorization failed                                                                   |
| 110000     | Session not found                                                                      |
| 110001     | Parent account not found                                                               |
| 110002     | Not found                                                                              |
| 110004     | Account type is not eligible to use this api                                           |
| 1016008    | Action not allowed because of current account status                                   |
| 200100     | Duplicate external id                                                                  |
| 200101     | Duplicate external id                                                                  |
| 200300     | Invalid payload                                                                        |
| 200301     | Invalid request                                                                        |
| 200302     | Invalid path parameter                                                                 |
| 200303     | Invalid header                                                                         |
| 210001     | Implementation error : invalid account ownership                                       |
| 210002     | Transaction not found                                                                  |
| 216001     | Transaction cannot be refunded                                                         |
| 216002     | Transaction is already refunded                                                        |
| 216005     | Partial refund not supported                                                           |
| 216006     | Multiple partial refunds not supported                                                 |
| 230002     | Implementation error : invalid account ownership                                       |
| 230003     | Payment method is not related to plaid                                                 |
| 232001     | Account status is not ACTIVE                                                           |
| 232005     | Action is not permitted because account type is not consumer                           |
| 232007     | Action is not permitted because account type is not Business                           |
| 232008     | Account type is not Business                                                           |
| 232009     | Configuration error: payment instruments                                               |
| 232010     | Configuration error: payment methods                                                   |
| 232011     | Configuration error: 3DS Failure url                                                   |
| 232012     | Configuration error: 3DS Success url                                                   |
| 232013     | Transaction cannot be authorized because wallet type is not checking                   |
| 232014     | Integration error: account type is not allowed to perform the action                   |
| 233001     | Card payment method is not active                                                      |
| 233003     | Payment instrument is not active                                                       |
| 233004     | Payment instrument not found                                                           |
| 233006     | Payment instrument invalid                                                             |
| 233007     | Portal error                                                                           |
| 234004     | Bank not found                                                                         |
| 310001     | Invalid payload                                                                        |
| 310002     | Invalid request                                                                        |
| 310003     | Invalid headers                                                                        |
| 310004     | Invalid get parameters                                                                 |
| 310005     | Invalid path parameters                                                                |
| 310008     | Invalid currency                                                                       |
| 320001     | Account not found                                                                      |
| 320002     | Implementation error : invalid account ownership                                       |
| 320004     | Account already exists                                                                 |
| 320005     | Action not permitted because Account is not of type CONSUMER                           |
| 320006     | Action not permitted because Account is not of type PROGRAM                            |
| 320009     | Account already deleted                                                                |
| 320010     | Action not permitted because Account status is PROCESSING                              |
| 320011     | Account already inactivated                                                            |
| 320013     | Account already activated                                                              |
| 320016     | Action not permitted because Account status is not ACTIVE                              |
| 320017     | Action not permitted because Account status is not ACTIVE or CREATED                   |
| 320018     | Action not permitted because Account status is not ACTIVE , CREATED or PENDING\_USER   |
| 320019     | Action not permitted because Account status is REJECTED or DELETED                     |
| 320020     | Action not permitted because Account status is not INACTIVE                            |
| 320028     | Action not permitted because of Invalid Account type                                   |
| 320031     | Duplicate external ID for Account                                                      |
| 320041     | Invalid request : Account type not supported                                           |
| 320053     | Action not permitted because Account status is REJECTED or DELETED                     |
| 320059     | Dossier Cannot be created because Account status is not CREATED or PENDING\_USER       |
| 320062     | Account is not of Wallet or Consumer type                                              |
| 320063     | Wallet not found                                                                       |
| 320070     | Action not allowed because account status is not CREATED or PENDING\_USER              |
| 320081     | Invalid account type                                                                   |
| 320082     | Action cannot be performed on Consumer account type                                    |
| 320090     | Account is not of type BUSINESS                                                        |
| 320091     | Account is not of type STAKEHOLDER                                                     |
| 320092     | ID Documents from a country that is not supported                                      |
| 320093     | ID document type is not supported                                                      |
| 320094     | Action cannot be performed on this account type                                        |
| 320095     | ID information is missing                                                              |
| 320096     | Account type is not CONSUMER or STAKEHOLDER                                            |
| 320097     | Account type is not CONSUMER or BUSINESS                                               |
| 320098     | Account is not of type CARDHOLDER                                                      |
| 320108     | Action not permitted because account status is MANUAL\_REVIEW                          |
| 320115     | Account age is below required minimum or above maximum                                 |
| 320116     | Action not permitted because this account type is not allowed                          |
| 320117     | Action not permitted because Account type is not allowed to create dossier             |
| 320118     | Profile is Invalid                                                                     |
| 320120     | Configuration error: profile related error                                             |
| 320122     | Wallet is not active yet                                                               |
| 320123     | Action not allowed for this account type                                               |
| 320126     | Action not allowed because of current account status                                   |
| 320127     | Action not allowed due to account status                                               |
| 329500     | Account is not of type BENEFICIARY                                                     |
| 329501     | Beneficiary doesn't belong to expected parent                                          |
| 329503     | Beneficiary not found                                                                  |
| 329505     | Beneficiary must have bank                                                             |
| 329506     | Beneficiary currency not allowed                                                       |
| 329520     | Beneficiary country error                                                              |
| 329523     | Beneficiary first name error                                                           |
| 329524     | Beneficiary last name error                                                            |
| 329537     | Beneficiary details missing error                                                      |
| 329546     | Beneficiary clabe missing/Invalid error                                                |
| 329551     | Beneficiary status does not allow fields to be updated                                 |
| 329552     | Local Beneficiary country not allowed                                                  |
| 329553     | Local Beneficiary currency not allowed                                                 |
| 329554     | Local Beneficiary Ach Account not valid                                                |
| 329555     | Local Beneficiary not valid bank type                                                  |
| 329557     | International Beneficiary Clabe Account not valid                                      |
| 329559     | Local Beneficiary missing ach bank Account details                                     |
| 329565     | Beneficiary legal type not allowed                                                     |
| 329567     | Beneficiary legal type does not allow these update values                              |
| 329568     | International Beneficiary cash pickup location not valid                               |
| 329569     | Beneficiary bank code or cash pickup location missing/Invalid error                    |
| 329570     | Beneficiary cash pickup location missing/Invalid error                                 |
| 329575     | Beneficiary payout method country error                                                |
| 329576     | Beneficiary payout method currency error                                               |
| 329577     | Invalid request : international beneficiary cant have bank type                        |
| 329579     | Action not allowed because beneficiary has transactions being processed                |
| 329580     | International Beneficiary country not allowed                                          |
| 329581     | International Beneficiary country not allowed                                          |
| 329582     | Beneficiary phone number missing/invalid                                               |
| 329583     | Beneficiary address missing/invalid                                                    |
| 329584     | Beneficiary IBAN missing/invalid                                                       |
| 329585     | Beneficiary SWIFT missing/invalid                                                      |
| 329586     | Beneficiary SWIFT bank missing                                                         |
| 329587     | Beneficiary SWIFT bank not found                                                       |
| 329588     | Beneficiary SWIFT bank country does not match                                          |
| 329589     | Beneficiary Tax ID missing/invalid                                                     |
| 329590     | Beneficiary EFT bank missing/invalid                                                   |
| 329591     | Beneficiary country change not allowed                                                 |
| 329602     | Business is not an allowed Account type                                                |
| 329615     | Business country of incorporation not allowed                                          |
| 329616     | Business Account doesn't belong to program                                             |
| 329618     | One of the stakeholders already exists                                                 |
| 329619     | Business account status does not allow fields to be updated                            |
| 329620     | Business country of incorporation is different                                         |
| 329622     | Invalid request                                                                        |
| 329624     | Action not allowed                                                                     |
| 329701     | The parent Business Account is in an Invalid status                                    |
| 329704     | Stakeholder Business Account not found                                                 |
| 329705     | Invalid data for stakeholder type                                                      |
| 329707     | the total percentage is larger than 100                                                |
| 329803     | Cardholder is not an allowed Account type                                              |
| 329804     | Cardholder account's parent type is not CONSUMER                                       |
| 329806     | Cardholder account update request not allowed                                          |
| 329809     | Cardholder account's parent is not active                                              |
| 329812     | Cardholder account not found                                                           |
| 329910     | Configuration error : bank missing                                                     |
| 329912     | Configuration error : documents combo missing                                          |
| 329913     | Configuration error : maximum wallet missing                                           |
| 329914     | Configuration error : maximum currency per wallet missing                              |
| 329915     | Configuration error : maximum wallet for specified type not found                      |
| 329930     | Invalid request                                                                        |
| 329934     | Configuration error : bank missing                                                     |
| 329935     | Configuration error : bank missing                                                     |
| 329939     | Country of issuance not allowed                                                        |
| 330000     | Profile not found                                                                      |
| 330005     | Profile changes are not allowed                                                        |
| 335000     | Card payment method belongs to a different account                                     |
| 335001     | Card payment method not found                                                          |
| 335002     | Duplicate external id                                                                  |
| 335028     | Card already deleted                                                                   |
| 335029     | Card allowed payment method limit exceeded                                             |
| 335030     | Name on card must be set                                                               |
| 335035     | Invalid Request: 3ds preference                                                        |
| 340000     | Bank not found                                                                         |
| 340001     | Bank payment method doesnt belong to this particular account                           |
| 340004     | Duplicate external id                                                                  |
| 340012     | Bank payment method update not allowed                                                 |
| 340016     | Bank payment method update not allowed                                                 |
| 340018     | Bank payment method already deleted                                                    |
| 340019     | Bank payment method allowed limit exceeded                                             |
| 340021     | Configuration error : bank account type not supported                                  |
| 340022     | Invalid request : bank account format not supported                                    |
| 340027     | Duplicate customer external id                                                         |
| 340028     | Bank not active                                                                        |
| 341000     | Action not permitted because payment method not associated with plaid                  |
| 341001     | Action not permitted because payment method is associated with plaid                   |
| 342000     | Number of maximum Wallets for Account already reached                                  |
| 343002     | Payout method already exists                                                           |
| 343003     | Payout method type is Invalid                                                          |
| 343005     | Payout method not found                                                                |
| 343006     | Payout method not found                                                                |
| 343009     | Duplicate external id                                                                  |
| 350000     | Duplicate primary address                                                              |
| 350001     | Primary address must be created first                                                  |
| 350004     | Primary address cannot be deleted                                                      |
| 350005     | Address already deleted                                                                |
| 350016     | Duplicate external id                                                                  |
| 350018     | Invalid request: missing state                                                         |
| 350019     | Invalid request : state malformed                                                      |
| 350020     | Invalid request : address country not allowed                                          |
| 350021     | Needs full billing address as account doesn't have a primary address                   |
| 385031     | Invalid request : 3ds not supported                                                    |
| 390202     | Dossier already exists                                                                 |
| 390203     | Dossier status is not allowed to perform action, must be Expired or Rejected or Failed |
| 390204     | Dossier already deleted                                                                |
| 390206     | Dossier not found                                                                      |
| 390207     | Dossier not found                                                                      |
| 390210     | Duplicate primary dossier                                                              |
| 390211     | Primary dossier must be created first                                                  |
| 390213     | Action not permitted because dossier status must be Created                            |
| 390214     | Action not permitted because dossier status must be Expired or Failed                  |
| 390215     | Replace not permitted because of current dossier status                                |
| 390217     | Action not allowed for this account type                                               |
| 390218     | Action not allowed because of current account status                                   |
| 390219     | Configuration error : program not allowed to use real time verification feature        |
| 390220     | Real time validation retry threshold reached                                           |
| 390221     | Documents issuance country not eligible for realtime verification                      |
| 390305     | Document type could not be matched                                                     |
| 390311     | Implementation Error: Ownership mismatch                                               |
| 390703     | Payment instrument not found                                                           |
| 390704     | Payment instrument doesnt belong to this account                                       |
| 390706     | Payment instrument already deleted                                                     |
| 390805     | Action not allowed because of profile request status                                   |
| 391001     | Funding instrument already exists                                                      |
| 391003     | Funding instrument not found                                                           |
| 391100     | Barcode code usage limit exceeded                                                      |
| 410000     | Account not found                                                                      |
| 410002     | Configuration error : service fees vault is missing                                    |
| 410200     | Transaction not permitted because the Account type is not vault                        |
| 410201     | Transaction not permitted because Account type is not program                          |
| 410202     | Transaction not permitted because the Account type is not vault                        |
| 410203     | Transaction not permitted because the Account type is not Business                     |
| 411000     | Transaction not permitted because account not found                                    |
| 411001     | Vault does not support withdrawal                                                      |
| 411002     | Vault does not support deposit                                                         |
| 411003     | Configuration error : Vault property                                                   |
| 411004     | Transaction not permitted because Account is not active                                |
| 411005     | Transaction not permitted because of ownership mismatch                                |
| 411007     | Transaction not permitted because of current Account status                            |
| 411008     | Account has similar transaction in manual review                                       |
| 411009     | Transaction not permitted because account not FBO                                      |
| 412000     | Configuration error: prefunding is not allowed                                         |
| 412100     | Transaction not permitted because of max balance limit                                 |
| 412101     | Transaction not permitted because of max balance limit                                 |
| 412102     | Origin and Destination vault groups differ from each other                             |
| 415000     | Wallet not found                                                                       |
| 415002     | Wallet type Invalid                                                                    |
| 415003     | Wallet status Invalid                                                                  |
| 415004     | Wallet not found                                                                       |
| 415005     | Transaction not permitted because Wallet is not active                                 |
| 415006     | Origin Wallet and Destination Wallet Currency are not the same                         |
| 420001     | Transaction not permitted because of insufficient funds                                |
| 420002     | Funds above maximum allowed                                                            |
| 420006     | Not sufficient funds                                                                   |
| 420007     | Account balance is negative                                                            |
| 420014     | Transaction not permitted because the Wallet balance is negative                       |
| 430000     | Transaction does not exist                                                             |
| 430001     | Idempotency error: transaction already exists in the system                            |
| 430006     | Transaction already refunded                                                           |
| 430100     | Invalid request: amount                                                                |
| 430102     | Same origin and destination Wallet                                                     |
| 430103     | Configuration error: minimum transaction amount                                        |
| 430104     | Configuration error: maximum transaction amount                                        |
| 430105     | Transaction action not allowed                                                         |
| 430106     | Transaction not permitted because amount exceeds daily limit                           |
| 430107     | Transaction not permitted because amount exceeds Account allowed rolling period limit  |
| 430108     | Transaction not permitted because amount below Account allowed minimum                 |
| 430109     | Transaction not permitted because amount exceeds Account allowed maximum               |
| 430110     | Transaction not permitted because amount exceeds Account allowed daily limit           |
| 430111     | Transaction not permitted because amount exceeds Account allowed rolling period limit  |
| 430201     | Transaction action cannot be performed because of current transaction status           |
| 430204     | Action not permitted                                                                   |
| 430400     | Transaction not permitted                                                              |
| 430409     | Action not allowed due to missing refund method                                        |
| 430410     | Action not allowed due to missing refund method                                        |
| 430411     | Action not allowed due to missing or invalid status reason                             |
| 430412     | Transaction not allowed because of address state                                       |
| 430413     | Invalid refund method                                                                  |
| 430502     | Receipt not found                                                                      |
| 430602     | Transaction is not cancelable                                                          |
| 430700     | Transactions statement period Invalid                                                  |
| 430701     | Transactions statement period not available                                            |
| 432000     | Invalid service fee type                                                               |
| 432001     | Invalid service fee description                                                        |
| 432002     | Invalid fee type                                                                       |
| 432003     | Bad Request: Amount is NULL or Negative for Fee Type = AMOUNT                          |
| 432004     | Bad Request: Percent is NULL or not between 0 and 100                                  |
| 432005     | Bad Request: Cap is NULL or Negative for a PERCENT\_CAPPED type                        |
| 432006     | Invalid request                                                                        |
| 432100     | Invalid request                                                                        |
| 433000     | Remittance quote not found                                                             |
| 433001     | Remittance quote already processed                                                     |
| 433003     | Remittance quote not found                                                             |
| 433004     | Remittance quote is expired                                                            |
| 450000     | Invalid request: payment method not found                                              |
| 450002     | Payment method Invalid                                                                 |
| 450003     | Payment method is not active                                                           |
| 450004     | Payment method not found                                                               |
| 452000     | Beneficiary not found                                                                  |
| 452001     | Beneficiary is not active                                                              |
| 452002     | Invalid account ownership                                                              |
| 460000     | Currency not found                                                                     |
| 460100     | Currency not allowed                                                                   |
| 492001     | Invalid Request : exchange\_rate cannot be passed                                      |
| 492002     | Invalid Request : exchange\_rate is required                                           |
| 492004     | Implementation error: ownership mismatch                                               |
| 492005     | Beneficiary is not active                                                              |
| 492008     | Beneficiary is not international                                                       |
| 492009     | Transaction not found                                                                  |
| 492010     | Invalid quote                                                                          |
| 492011     | Payout method does not belong to Beneficiary                                           |
| 492018     | Invalid transaction purpose                                                            |
| 492019     | Invalid source of funds                                                                |
| 492020     | Invalid phone number                                                                   |
| 492021     | Business Account is missing incorporation date                                         |
| 494001     | Account not found                                                                      |
| 494003     | Beneficiary not local                                                                  |
| 494005     | Payout method not found                                                                |
| 494007     | Implementation error: ownership mismatch                                               |
| 494008     | Invalid funding method                                                                 |
| 499001     | Invalid request error                                                                  |
| 499003     | Invalid request : missing parameter                                                    |
| 500003     | Invalid Headers                                                                        |
| 510000     | Action not allowed because Issued card was not found                                   |
| 510002     | Issued card doesnt not found                                                           |
| 510003     | Issued card action not possible to be performed                                        |
| 510004     | Issued card not active                                                                 |
| 510007     | Issued card is not ready to activate                                                   |
| 510015     | Issued card already active                                                             |
| 510016     | Issued card is not physical                                                            |
| 510017     | Issued card is blocked                                                                 |
| 510018     | Account status is not in a valid state for card activation                             |
| 510019     | Card info missing for activation                                                       |
| 510021     | Shipping address is not valid                                                          |
| 510023     | Issued card already created                                                            |
| 510028     | Card brand is not supported                                                            |
| 510029     | Card not found                                                                         |
| 510030     | Mastercard parameters not present for a Mastercard card                                |
| 510031     | VISA parameters not present for a VISA card                                            |
| 510032     | Action not allowed because associated card doesn't have any address                    |
| 510033     | Configuration error : incentives are not allowed for the program                       |
| 510034     | Configuration error : product id is not set                                            |
| 510036     | Invalid request : initial balance must be sent for this issued card type               |
| 510037     | Invalid request : initial balance should not be sent                                   |
| 510038     | Configuration error: merchants are not allowed                                         |
| 510039     | Configuration error: custom field emboss id is missing for the card product            |
| 510040     | Invalid request : emboss id is missing                                                 |
| 510041     | Configuration error : custom field shipping method not allowed                         |
| 510042     | Name on card issued too long                                                           |
| 510043     | Invalid request : name on card is Invalid                                              |
| 510044     | Maximum issued card limit reached                                                      |
| 510045     | Invalid request: duplicate external id                                                 |
| 510046     | Configuration error : incentives are not allowed for the program                       |
| 510047     | Card not found                                                                         |
| 510048     | Card type is not allowed for wallet type                                               |
| 510049     | Maximum issued card limit reached                                                      |
| 510060     | Configuration error : carrier\_id is missing                                           |
| 510061     | Carrier\_id is missing                                                                 |
| 510062     | Carrier\_id cannot be passed                                                           |
| 510064     | Card is not ACTIVE                                                                     |
| 510066     | Provided card pin is not valid                                                         |
| 510067     | Card is BLOCKED                                                                        |
| 510068     | Card product is missing from Configuration                                             |
| 510072     | Configuration error: card issued type                                                  |
| 510073     | Configuration error: pin length missing                                                |
| 510075     | Invalid service fee                                                                    |
| 510076     | Duplicate service fee external id                                                      |
| 510078     | Action not possible because of card status                                             |
| 510079     | Card initial balance doesn't cover deduct service fees                                 |
| 510080     | Invalid card genre for usage of carrier message                                        |
| 510082     | Configuration error: name length                                                       |
| 510083     | Action not allowed for this card type                                                  |
| 510084     | Card replace not allowed due to insufficient funds                                     |
| 510085     | Card replace not allowed for card genre                                                |
| 510086     | Card replace not possible to be performed                                              |
| 510088     | Card replace not allowed for card status                                               |
| 510091     | Card has already been replaced                                                         |
| 510092     | Invalid card type for usage of carrier message                                         |
| 510094     | The requested card operation is not yet supported                                      |
| 510095     | Emboss\_id is Invalid                                                                  |
| 510096     | Configuration error : generic card issuance                                            |
| 510103     | Card replace duplicate                                                                 |
| 510104     | Card genre Invalid                                                                     |
| 510105     | Invalid Wallet type                                                                    |
| 510107     | line\_2 text not allowed in the request                                                |
| 510108     | carrier\_id not allowed in the request                                                 |
| 510118     | Card is frozen                                                                         |
| 510119     | Cannot add card to digital wallet                                                      |
| 515001     | Invalid get parameters                                                                 |
| 515002     | Invalid path parameters                                                                |
| 515004     | Invalid request                                                                        |
| 515005     | Invalid payload                                                                        |
| 515006     | Invalid Expiration Date                                                                |
| 515007     | Invalid Expiration Times                                                               |
| 515008     | Wallet uuid Invalid                                                                    |
| 515009     | Card uuid Invalid                                                                      |
| 515010     | Program uuid required                                                                  |
| 520001     | Implementation error : invalid account ownership                                       |
| 520003     | Account status is not allowed, must be Active                                          |
| 520004     | Account status is Invalid                                                              |
| 520012     | Wallet must be active                                                                  |
| 520014     | Action not possible because consumer account not available                             |
| 520015     | Configuration error: maximum cards                                                     |
| 520020     | Wallet not found                                                                       |
| 520021     | Action not supported for this account type                                             |
| 520022     | Action not supported for this account type                                             |
| 520023     | Account has insufficient balance                                                       |
| 520025     | Account has negative funds                                                             |
| 520035     | Not found                                                                              |
| 520036     | Action not allowed because of current account status                                   |
| 530000     | No incentive rule found                                                                |
| 530001     | Incentive rule not found                                                               |
| 530003     | Incentive rule already deleted                                                         |
| 530009     | Incentive rule already exist                                                           |
| 530010     | Incentive rule already activated                                                       |
| 530011     | Incentive rule already inactivated                                                     |
| 531004     | Card incentive already exists                                                          |
| 531005     | Card incentive duplicate in request                                                    |
| 532004     | Service fee already exist                                                              |
| 610000     | Account not found                                                                      |
| 610002     | Implementation error : invalid account ownership                                       |
| 610004     | Account is already deleted                                                             |
| 610007     | Account not type consumer                                                              |
| 610013     | Account is rejected                                                                    |
| 610014     | Account already verified                                                               |
| 610016     | at least one active stakeholder should exist                                           |
| 625027     | account not ready for validation yet                                                   |
| 627000     | Transaction not found                                                                  |
| 699101     | System error (e.g., a temporary problem with Alviere's servers)                        |
| 699400     | Portal error                                                                           |
| 710001     | Invalid Payload                                                                        |
| 710002     | Invalid Request                                                                        |
| 710003     | Invalid Headers                                                                        |
| 710005     | Invalid Path Parameters                                                                |
| 715000     | Account or Wallet Not Found                                                            |
| 715001     | Only Account Type Consumer Is Permitted to Do This Transaction                         |
| 715002     | Account Is Not Active                                                                  |
| 715003     | Implementation Error: Invalid Account Ownership                                        |
| 715004     | Wallet Is Not Active                                                                   |
| 715006     | Invalid Wallet Type                                                                    |
| 715007     | Action not allowed because of current account status                                   |
| 715008     | Action not allowed because of current account status                                   |
| 720003     | Check Already Exists                                                                   |
| 720004     | No Relevant                                                                            |
| 720005     | Check Not Found                                                                        |
| 720014     | Check Not Found                                                                        |
| 720018     | Check Deposit Transaction Denied, Max Balance Exceeded                                 |
| 720019     | Check Deposit Transaction Denied, Amount Below Account Allowed Minimum                 |
| 720020     | Check Deposit Transaction Denied, Amount Above Account Allowed Maximum                 |
| 720021     | Check Deposit Transaction Denied, Amount Exceeds Account Allowed Daily Limit           |
| 720022     | Check Deposit Transaction Denied, Amount Exceeds Account Allowed Rolling Period Limit  |
| 720023     | Check Return Not Found                                                                 |
| 720026     | Transaction Type Not Allowed for This Wallet                                           |
| 720028     | Invalid Request: Service Fee Amount Is Wrong                                           |
| 910001     | Invalid Payload                                                                        |
| 910002     | Invalid Request                                                                        |
| 910003     | Invalid Headers                                                                        |
| 910004     | Invalid Get Parameters                                                                 |
| 910005     | Invalid Path Parameters                                                                |
| 915001     | Consumer Account Status Is Not Active                                                  |
| 915002     | Consumer Account Status Is Not Active                                                  |
| 915003     | Wallet Type Is Not Checking                                                            |
| 915004     | DDA Not Found                                                                          |
| 915005     | Implementation Error: Invalid Account Ownership                                        |
| 915006     | Action Not Permitted Because Account Type Is Not Consumer                              |
