import requests
import json

# Sample JSON data
json_data = [
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 9,
        "aisle": 2,
        "description": "A classic romance novel set in 19th-century England",
        "isbn": "9781503290563",
        "publisher": "T. Egerton",
        "edition": "First Edition",
        "monetaryValue": 12.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "genre": "fiction",
        "ageCategory": "teen",
        "count": 7,
        "aisle": 4,
        "description": "A story of teenage rebellion and alienation",
        "isbn": "9780316769488",
        "publisher": "Little, Brown and Company",
        "edition": "First Edition",
        "monetaryValue": 10.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Brave New World",
        "author": "Aldous Huxley",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 6,
        "aisle": 7,
        "description": "A vision of a future society dominated by technology and control",
        "isbn": "9780060850524",
        "publisher": "Chatto & Windus",
        "edition": "First Edition",
        "monetaryValue": 16.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "genre": "fiction",
        "ageCategory": "children",
        "count": 15,
        "aisle": 1,
        "description": "A fantasy adventure in Middle-earth",
        "isbn": "9780345339683",
        "publisher": "George Allen & Unwin",
        "edition": "First Edition",
        "monetaryValue": 13.95,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "War and Peace",
        "author": "Leo Tolstoy",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 4,
        "aisle": 9,
        "description": "A sprawling narrative of Russian society during the Napoleonic Wars",
        "isbn": "9781853260629",
        "publisher": "The Russian Messenger",
        "edition": "First Edition",
        "monetaryValue": 18.00,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Ulysses",
        "author": "James Joyce",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 3,
        "aisle": 9,
        "description": "A novel that parallels Homer’s Odyssey in a modern Dublin setting",
        "isbn": "9780199535675",
        "publisher": "Shakespeare and Company",
        "edition": "First Edition",
        "monetaryValue": 22.50,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Crime and Punishment",
        "author": "Fyodor Dostoevsky",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 10,
        "aisle": 8,
        "description": "An exploration of morality and guilt through the eyes of a young student",
        "isbn": "9780140449136",
        "publisher": "The Russian Messenger",
        "edition": "First Edition",
        "monetaryValue": 13.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Great Expectations",
        "author": "Charles Dickens",
        "genre": "fiction",
        "ageCategory": "teen",
        "count": 11,
        "aisle": 4,
        "description": "A coming-of-age story about an orphan named Pip",
        "isbn": "9780141439563",
        "publisher": "Chapman & Hall",
        "edition": "First Edition",
        "monetaryValue": 12.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
        {
        "title": "Jane Eyre",
        "author": "Charlotte Bronte",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 9,
        "aisle": 5,
        "description": "The story of an orphaned girl and her life challenges",
        "isbn": "9780142437209",
        "publisher": "Smith, Elder & Co.",
        "edition": "First Edition",
        "monetaryValue": 14.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Wuthering Heights",
        "author": "Emily Bronte",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 7,
        "aisle": 5,
        "description": "A gothic novel set on the Yorkshire Moors",
        "isbn": "9780141439556",
        "publisher": "Thomas Cautley Newby",
        "edition": "First Edition",
        "monetaryValue": 13.50,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "The Odyssey",
        "author": "Homer",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 10,
        "aisle": 1,
        "description": "An epic journey of Odysseus returning home",
        "isbn": "9780140268867",
        "publisher": "Ancient Greece",
        "edition": "Translated Edition",
        "monetaryValue": 17.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Anna Karenina",
        "author": "Leo Tolstoy",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 6,
        "aisle": 9,
        "description": "A complex love story set in Russian high society",
        "isbn": "9780143035008",
        "publisher": "The Russian Messenger",
        "edition": "First Edition",
        "monetaryValue": 19.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "The Brothers Karamazov",
        "author": "Fyodor Dostoevsky",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 5,
        "aisle": 8,
        "description": "A novel exploring faith, family, and morality",
        "isbn": "9780140449242",
        "publisher": "The Russian Messenger",
        "edition": "First Edition",
        "monetaryValue": 18.00,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Les Misérables",
        "author": "Victor Hugo",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 6,
        "aisle": 7,
        "description": "A tale of justice, redemption, and love in 19th-century France",
        "isbn": "9780451419439",
        "publisher": "A. Lacroix, Verboeckhoven & Cie",
        "edition": "First Edition",
        "monetaryValue": 20.50,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Dracula",
        "author": "Bram Stoker",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 4,
        "aisle": 6,
        "description": "A Gothic horror novel introducing Count Dracula",
        "isbn": "9780486411095",
        "publisher": "Archibald Constable and Company",
        "edition": "First Edition",
        "monetaryValue": 12.75,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "A Tale of Two Cities",
        "author": "Charles Dickens",
        "genre": "historical fiction",
        "ageCategory": "teen",
        "count": 10,
        "aisle": 4,
        "description": "A novel set during the French Revolution",
        "isbn": "9780141439600",
        "publisher": "Chapman & Hall",
        "edition": "First Edition",
        "monetaryValue": 13.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "The Divine Comedy",
        "author": "Dante Alighieri",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 5,
        "aisle": 1,
        "description": "An epic journey through Hell, Purgatory, and Paradise",
        "isbn": "9780140448955",
        "publisher": "Italy",
        "edition": "Translated Edition",
        "monetaryValue": 18.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Frankenstein",
        "author": "Mary Shelley",
        "genre": "fiction",
        "ageCategory": "teen",
        "count": 9,
        "aisle": 6,
        "description": "A story of a scientist's creation and its consequences",
        "isbn": "9780141439471",
        "publisher": "Lackington, Hughes, Harding, Mavor & Jones",
        "edition": "First Edition",
        "monetaryValue": 11.99,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Heart of Darkness",
        "author": "Joseph Conrad",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 7,
        "aisle": 6,
        "description": "A journey into the depths of colonial Africa",
        "isbn": "9780141441672",
        "publisher": "Blackwood's Magazine",
        "edition": "First Edition",
        "monetaryValue": 12.50,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "The Scarlet Letter",
        "author": "Nathaniel Hawthorne",
        "genre": "fiction",
        "ageCategory": "adult",
        "count": 8,
        "aisle": 4,
        "description": "A novel about sin and redemption in Puritan society",
        "isbn": "9780142437261",
        "publisher": "Ticknor, Reed & Fields",
        "edition": "First Edition",
        "monetaryValue": 13.75,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Kautilya's Arthashastra",
        "author": "Chanakya",
        "genre": "Non-Fiction",
        "ageCategory": "Adult",
        "count": 3,
        "aisle": 2,
        "description": "Ancient Indian treatise on statecraft and military strategy.",
        "isbn": "9780140446036",
        "publisher": "Penguin Classics",
        "edition": "Translation",
        "monetaryValue": 24.00,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "Don Quixote",
        "author": "Miguel de Cervantes",
        "genre": "Fiction",
        "ageCategory": "Adult",
        "count": 6,
        "aisle": 3,
        "description": "A novel about a man who becomes a self-styled knight.",
        "isbn": "9780142437230",
        "publisher": "Francisco de Robles",
        "edition": "First Edition",
        "monetaryValue": 15.50,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "The Aeneid",
        "author": "Virgil",
        "genre": "Other",
        "ageCategory": "Adult",
        "count": 4,
        "aisle": 1,
        "description": "An epic about the founding of Rome.",
        "isbn": "9780140449327",
        "publisher": "Ancient Rome",
        "edition": "Translation",
        "monetaryValue": 17.00,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    },
    {
        "title": "The Iliad",
        "author": "Homer",
        "genre": "Other",
        "ageCategory": "Adult",
        "count": 6,
        "aisle": 1,
        "description": "An ancient Greek epic poem about the Trojan War.",
        "isbn": "9780140275360",
        "publisher": "Ancient Greece",
        "edition": "Translated Edition",
        "monetaryValue": 18.00,
        "lastUpdatedBy": 1,
        "imgUrl": "https://m.media-amazon.com/images/I/61OTNorhqVS._AC_UF894,1000_QL80_.jpg",
        "availabilityStatus": 1
    }
    # Add other book objects here...
]

def post_books(data):
    endpoint = 'https://library-database-backend.onrender.com/api/books/createBook'  # Replace with your actual endpoint

    for book in data:
        try:
            # Send a POST request with the book data
            response = requests.post(endpoint, json=book)
            response.raise_for_status()  # Raise an error for bad responses

            # Attempt to parse the response as JSON
            print('Success:', response.json())
        except requests.exceptions.HTTPError as err:
            # HTTP errors (4xx, 5xx)
            print(f'Error posting book "{book.get("title", "Unknown title")}":', err)
            print('Response Text:', response.text)  # Print the response text for additional context
        except requests.exceptions.RequestException as req_err:
            # Other request errors (network issues, etc.)
            print(f'Request error occurred: {req_err}')
        except json.JSONDecodeError:
            # Handle JSON decode errors separately
            print(f'Error decoding JSON response for book "{book.get("title", "Unknown title")}":', response.text)

# Sam

# Call the function
post_books(json_data)
