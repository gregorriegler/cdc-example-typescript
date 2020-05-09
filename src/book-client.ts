import {none, Option, some} from "fp-ts/lib/Option";

const bent = require("bent")

export function bookClient(baseUrl: string) {
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

    return {
        allBooks: async (): Promise<Array<Book>> => {
            let response = await bent(baseUrl, "json")("/books")
            return response.map(decodeBook);
        },
        requestBook: async (path: string): Promise<Option<Book>> => {
            const getStream = bent(baseUrl, 200, 404)
            let stream = await getStream(path);
            if (stream.status !== 200) {
                console.info(await stream.text())
                return none;
            }
            return some(decodeBook(await stream.json()))
        }
    }
}