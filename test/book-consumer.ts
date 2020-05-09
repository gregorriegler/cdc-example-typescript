import {bookClient} from "../book-client";
import {none, some} from 'fp-ts/lib/Option'

const {Pact} = require("@pact-foundation/pact")
const expect = require("chai").expect

const requestAListOfBooks = {
    state: "two books",
    uponReceiving: "a request for all books",
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
    uponReceiving: "a request for the first book",
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

const requestANonExistingBook = {
    state: "two books",
    uponReceiving: "a request for a non existing book",
    withRequest: {
        method: "GET",
        path: "/books/3"
    },
    willRespondWith: {
        status: 404
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

    afterEach(async () => {
        await producer.verify()
    })

    after(() => {
        producer.finalize()
    })

    describe("requesting a list of books", () => {
        before(() => {
            producer.addInteraction(requestAListOfBooks)
        })

        it("finds the list of books", async () => {
            let bookList = await bookClient("http://localhost:1234").allBooks();

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
            let book = await bookClient("http://localhost:1234").requestBook("/books/1");

            expect(book).to.deep.equal(some({self: "/books/1", title: "Hello Book 1"}))
        })
    })

    describe("requesting a non existing book", () => {
        before(() => {
            producer.addInteraction(requestANonExistingBook)
        })

        it("finds nothing", async () => {
            let book = await bookClient("http://localhost:1234").requestBook("/books/3");

            expect(book).to.equal(none)
        })
    })
})