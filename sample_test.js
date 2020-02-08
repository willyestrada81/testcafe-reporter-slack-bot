// This a sample test in order to generate a report to be used in the slack bot app
import { Selector } from 'testcafe'

fixture('Google Page')
  .page('https://google.com')

test('Should User Be able to type text in input', async (t) => {
  const container = Selector('div#hptl')
  await t
    .expect(container.child(0).visible).ok()
    .typeText(Selector('input.gLFyf'), 'facebook')
    .pressKey('enter')
})

fixture('Google 2')
  .page('https://google.com')

test('User is able to create a new script category', async (t) => {
  const container = Selector('div#hptl')
  await t
    .expect(container.child(0).visible).ok()
    .typeText(Selector('input.gLFyf'), 'facebook')
    .pressKey('enter')
})
test('Page redirects when user type text in search input', async (t) => {
  const container = Selector('div#hptl')
  await t
    .expect(container.child(0).visible).ok()
    .typeText(Selector('input.gLFyf'), 'facebook')
    .pressKey('enter')
})
