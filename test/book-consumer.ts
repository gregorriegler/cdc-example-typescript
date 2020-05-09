const {Pact} = require("@pact-foundation/pact")
const bent = require("bent")
const getJSON = bent("json")
const expect = require("chai").expect

const requestAListOfBooks = {
    state: "two books",
    uponReceiving: "a request for retrieving all books",
    withRequest: {
        method: "GET",
        path: "/books"
    },
    willRespondWith: {
        status: 200,
        headers: {"Content-Type": "application/json"},
        body: [
            {
                "self": "/books/1",
                "title": "Hello Book 1"
            },
            {
                "self": "/books/2",
                "title": "Hello Book 2"
            }
        ]
    },
};

const requestASingleBook = {
    state: "two books",
    uponReceiving: "a request for retrieving the first book",
    withRequest: {
        method: "GET",
        path: "/books/1"
    },
    willRespondWith: {
        status: 200,
        headers: {"Content-Type": "application/json"},
        body: {
            "self": "/books/1",
            "title": "Hello Book 1"
        }
    }
};

describe("Books Client", () => {
    const producer = new Pact({
        consumer: "Book Consumer",
        provider: "Book Producer",
        port: 1234
    })

    before(async () => {
        await producer.setup()
    })

    afterEach(() => {
        producer.verify()
    })

    after(() => {
        producer.finalize()
    })

    describe("requesting a list of books", () => {
        before(() => {
            producer.addInteraction(requestAListOfBooks)
        })

        it("finds the list of books", async () => {
            type Book = {
                self: string
                title: string
            }

            function decodeBook(object): Book {
                return {
                    self: object.self,
                    title: object.title
                }
            }

            let response = await getJSON("http://localhost:1234" + "/books")

            let bookList: Array<Book> = response.map(decodeBook)

            expect(bookList).to.deep.equal([
                {self: "/books/1", title: "Hello Book 1"},
                {self: "/books/2", title: "Hello Book 2"}
            ])
        })
    })

    describe("requesting a single book", () => {
        before(() => {
            producer.addInteraction(requestASingleBook)
        })

        it("finds the book", async () => {
            type Book = {
                self: string
                title: string
            }

            function decodeBook(object): Book {
                return {
                    self: object.self,
                    title: object.title
                }
            }

            let response = await getJSON("http://localhost:1234" + "/books/1")

            let book: Book = decodeBook(response)

            expect(book).to.deep.equal({self: "/books/1", title: "Hello Book 1"})
        })
    })
});