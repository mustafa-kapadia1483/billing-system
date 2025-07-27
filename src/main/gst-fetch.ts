import type { GstCaptchaResponse, GstDetailsResponse } from '../shared/types'

const CONSTANTS = {
  GST_REGEX: /[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Zz1-9A-Ja-j]{1}[0-9a-zA-Z]{1}/,
  CAPTCHA_REGEX: /^([0-9]){6}$/,
  GST_DETAILS_URL: 'https://services.gst.gov.in/services/api/search/taxpayerDetails',
  GST_CAPTCHA_URL: 'https://services.gst.gov.in/services/captcha?rnd=',
  INVALID_GST_CODE: 'SWEB_9035',
  INVALID_CAPTCHA_CODE: 'SWEB_9000',
  CAPTCHA_COOKIE_STRING: 'CaptchaCookie'
}

enum HttpStatus {
  OK = 200,
  BAD_REQUEST = 400,
  INTERNAL_SERVER_ERROR = 500
}

export async function getGstCaptcha(): Promise<GstCaptchaResponse> {
  try {
    const url: string = `${CONSTANTS.GST_CAPTCHA_URL}${Math.random()}`

    // Fetch captcha image
    const captchaResponse = await fetch(url, {
      method: 'GET'
    })

    if (!captchaResponse.ok) {
      throw new Error(`HTTP error! status: ${captchaResponse.status}`)
    }

    // Get array buffer for image
    const arrayBuffer = await captchaResponse.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    // Get captcha cookie from headers
    const rawCookie = captchaResponse.headers.get('set-cookie')
    let captcha_cookie: string = ''

    if (rawCookie) {
      const cookieParts = rawCookie.split(';')
      for (let i = 0; i < cookieParts.length; i++) {
        const cookieString = cookieParts[i].split('=')
        if (cookieString[0].trim() === CONSTANTS.CAPTCHA_COOKIE_STRING) {
          captcha_cookie = cookieString[1]
          break
        }
      }
    }

    return Promise.resolve({
      code: captchaResponse.status,
      data: {
        captcha_image: base64Image,
        captcha_cookie: captcha_cookie
      }
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

function validGstCheckSum(gst_number: string): boolean {
  const gstSubstring = gst_number.substring(0, 14)

  let factor = 2,
    sum = 0,
    checkCodePoint = 0,
    digit: number,
    mod: number,
    codePoint: number,
    inputChars: string | any[]
  const cpChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  inputChars = gstSubstring.trim().toUpperCase()

  mod = cpChars.length
  for (let i = inputChars.length - 1; i >= 0; i = i - 1) {
    codePoint = -1
    for (let j = 0; j < cpChars.length; j = j + 1) {
      if (cpChars[j] === inputChars[i]) {
        codePoint = j
      }
    }

    digit = factor * codePoint
    factor = factor === 2 ? 1 : 2
    digit = digit / mod + (digit % mod)
    sum += Math.floor(digit)
  }
  checkCodePoint = (mod - (sum % mod)) % mod

  return gstSubstring + cpChars[checkCodePoint] === gst_number
}

export const validGstNumber = (gst_number: string) => {
  return validGstCheckSum(gst_number)
}

export async function fetchGstDetails(
  gst_number: string,
  captcha: string,
  captcha_cookie: string
): Promise<GstDetailsResponse> {
  try {
    let gstDetailsResponse
    if (!validGstNumber(gst_number)) {
      return {
        code: HttpStatus.BAD_REQUEST,
        error: 'Invalid Request',
        error_description: `Invalid GST Number`
      }
    }

    const payload = {
      gstin: gst_number,
      captcha: captcha
    }

    const response = await fetch(CONSTANTS.GST_DETAILS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `CaptchaCookie=${captcha_cookie}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const gstData = await response.json()

    if (gstData?.message === null) {
      if (gstData?.errorCode === CONSTANTS.INVALID_GST_CODE) {
        return {
          code: HttpStatus.BAD_REQUEST,
          error: 'Invalid Request',
          error_description: `Invalid GST Number`
        }
      } else if (gstData?.errorCode === CONSTANTS.INVALID_CAPTCHA_CODE) {
        return {
          code: HttpStatus.BAD_REQUEST,
          error: 'Invalid Request',
          error_description: `Invalid GST Captcha`
        }
      }
    } else {
      gstDetailsResponse = {
        status: gstData.sts,
        legalName: gstData.lgnm,
        businessNature: gstData.nba,
        address: gstData.pradr.adr,
        companyType: gstData.ctb,
        tradeName: gstData.tradeNam
      }
    }

    return {
      code: HttpStatus.OK,
      data: gstDetailsResponse
    }
  } catch (error) {
    return Promise.reject({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error' + error,
      error_description: `Something went wrong`
    })
  }
}
