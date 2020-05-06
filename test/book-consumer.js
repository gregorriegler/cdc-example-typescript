const {Pact} = require('@pact-foundation/pact')
const bent = require('bent')
const getJSON = bent('json')
const expect = require('chai').expect

describe('Book Consumer', () => {
    const producer = new Pact({
        consumer: 'Book Consumer',
        provider: 'Book Producer',
        port: 1234
    })

    before(async () => {
        await producer.setup().then(() => {
            producer.addInteraction({
                state: 'two books',
                uponReceiving: 'a request for retrieving the book',
                withRequest: {
                    method: 'GET',
                    path: '/books'
                },
                willRespondWith: {
                    status: 200,
                    headers: {'Content-Type': 'application/json'},
                    body: [
                        {
                            'self': '/books/1',
                            'title': 'Hello Book 1'
                        },
                        {
                            'self': '/books/2',
                            'title': 'Hello Book 2'
                        }
                    ]
                },
            })
        })
    })

    it('can find all books in a list', async () => {
        class Book {
            constructor(self, title) {
                this.self = self
                this.title = title
            }

            static fromJson(bookJson) {
                return new Book(bookJson.self, bookJson.title)
            }
        }

        let response = await getJSON('http://localhost:1234/books')
        let books = response.map(bookEntry => Book.fromJson(bookEntry));

        expect(books).to.deep.equal([
            new Book("/books/1", "Hello Book 1"),
            new Book("/books/2", "Hello Book 2")
        ])
    })

    afterEach(() => {
        producer.verify()
    })

    after(() => {
        producer.finalize()
    })
});