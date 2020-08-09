/**
 * From Upterm
 */

const execFile = require('child-process-promise').execFile

const manPageToOptions = async (
  command: string,
  section = 'DESCRIPTION',
): Promise<Suggestion[]> => {
  // use execFile to prevent a command like "; echo test" from running the "echo test"
  const { stdout, stderr } = await execFile('man', [command], {})
  if (stderr || !stdout) {
    throw `Error in retrieving man page: ${command}`
  }

  // "Apply" backspace literals
  const manContents = preprocessManPage(stdout)

  const manSections = extractManPageSections(manContents)

  // Make sure section is in manSections
  if (!(section in manSections)) {
    throw `Error in retrieving section "${section}" from man page: ${command}`
  }

  // Split the description section (which contains the flags) into paragraphs
  /* tslint:disable:no-string-literal */
  const manDescriptionParagraphs: string[][] = extractManPageSectionParagraphs(
    manSections[section],
  )
  /* tslint:enable:no-string-literal */

  // Extract the paragraphs that describe flags, and parse out the flag data
  return manDescriptionParagraphs
    .map(suggestionFromFlagParagraph)
    .filter((s: Suggestion | undefined) => s !== undefined) as Suggestion[]
}

export default manPageToOptions

export const combineManPageLines = (lines: string[]) =>
  lines
    .map(line => line.trim())
    .reduce((memo, next) => {
      if (next.endsWith('-')) {
        return memo.concat(next.slice(0, -1))
      } else {
        return memo.concat(next, ' ')
      }
    }, '')
    .trim()

// Man pages have backspace literals, so "apply" them, and remove excess whitespace.
export const preprocessManPage = (contents: string) =>
  contents.replace(/.\x08/g, '').trim()

export const extractManPageSections = (contents: string) => {
  const lines = contents.split('\n')

  let currentSection = ''
  let sections: { [section: string]: string[] } = {}
  lines.forEach((line: string) => {
    if (line.startsWith(' ') || line === '') {
      sections[currentSection].push(line)
    } else {
      currentSection = line
      if (!sections[currentSection]) {
        sections[currentSection] = []
      }
    }
  })

  return sections
}

const isShortFlagWithoutArgument = (manPageLine: string) =>
  /^ *-(\w) *(.*)$/.test(manPageLine)

export const extractManPageSectionParagraphs = (contents: string[]) => {
  let filteredContents: string[] | undefined = undefined
  const firstFlag = contents.find(isShortFlagWithoutArgument)
  if (firstFlag) {
    const flagMatch = firstFlag.match(/^( *-\w *)/)
    const flagIndentation = ' '.repeat((flagMatch || [''])[0].length)
    filteredContents = contents.filter((line, index, array) => {
      if (index === 0 || index === array.length - 1) {
        return true
      }
      if (
        line === '' &&
        array[index - 1].startsWith(flagIndentation) &&
        array[index + 1].startsWith(flagIndentation)
      ) {
        return false
      }
      return true
    })
  }

  return (filteredContents ? filteredContents : contents)
    .reduce(
      (memo, next) => {
        if (next === '') {
          memo.push([])
        } else {
          memo[memo.length - 1].push(next)
        }
        return memo
      },
      <string[][]>[[]],
    )
    .filter(lines => lines.length > 0)
}

export const suggestionFromFlagParagraph = (
  paragraph: string[],
): Suggestion | undefined => {
  const shortFlagWithArgument = paragraph[0].match(/^ *-(\w) (\w*)$/)
  const shortFlagWithoutArgument = paragraph[0].match(/^ *-(\w) *(.*)$/)
  if (shortFlagWithArgument) {
    const flag = shortFlagWithArgument[1]
    const detail = combineManPageLines(paragraph.slice(1))

    return {
      label: `-${flag}`,
      detail: detail,
    }
  } else if (shortFlagWithoutArgument) {
    const flag = shortFlagWithoutArgument[1]
    const detail = combineManPageLines([
      shortFlagWithoutArgument[2],
      ...paragraph.slice(1),
    ])

    return {
      label: `-${flag}`,
      detail: detail,
    }
  } else {
    return undefined
  }
}

export interface Suggestion {
  /**
   * The label of this completion item. By default
   * this is also the text that is inserted when selecting
   * this completion.
   */
  label: string
  /**
   * A human-readable string with additional information
   * about this item, like type or symbol information.
   */
  detail?: string
  /**
   * A human-readable string that represents a doc-comment.
   */
  documentation?: string
  /**
   * A string that should be used when comparing this item
   * with other items. When `falsy` the [label](#CompletionItem.label)
   * is used.
   */
  sortText?: string
  /**
   * A string that should be used when filtering a set of
   * completion items. When `falsy` the [label](#CompletionItem.label)
   * is used.
   */
  filterText?: string
}
