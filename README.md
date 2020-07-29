## Create a GraphQL endpoint with following spec:

```
query getThumbnails($id: string!) {
  thumbnail(id: $id) {
      id:int
      created_at:int        //timestamp
      status:String         //processing|completed|failed
      error_message:String  //not empty when `status` value is `failed`
      error_code:int        //not empty when `status` value is `failed`
      website:String        //url
      urls {
	      _256:String       //url
	      _512:String       //url
    	}
  }
}

mutation addThumbnails($website: String) {
  insert_thumbnail(objects: {website: $website}){
    returning {
      id:int
      created_at:int        //timestamp
      status:String         //processing|completed|failed
      error_message:String  //not empty when `status` value is `failed`
      error_code:int        //not empty when `status` value is `failed`
      website:String        //url
      urls {
	      _256:String       //url
	      _512:String       //url
    	}
    }
  }
}
```
### setup:
- Code is written in Typescript.
- Solution is dockerized. ( setup is described with a `Dockerfile`).
- Runnable with docker compose ( there is `docker-compose.yaml` to run).
### challenges:

 1. (**_primary_**) `thumbnail` query and `insert_thumbnail` mutation works as follows: 
	 - `insert_thumbnail` receives a `website` string input with `protocol://domain.tld` format and makes a PNG screenshot out of it.
	 -  `status` represents thumbnail generation status. status can have following values:
		 - `processing`: thumbnail is being generated. in this state `url` values are empty as processing is still ongoing.  **_For current challenge, `insert_thumbnail` mutation is synchronous and only returns a value after generating thumbnail attempt is done. So in practice, we should NOT see this value at all._**
		 - `completed`: thumbnail generation finished successfully. now ´url´ should have thumbnails with corresponding resolution.
		 - `failed`: thumbnail generation has failed. `error_message` and `error_code` needs to be set.(these fields can be random even. It does not matter much)
	 - Screenshots are served as static files and their urls returned to client(_via `insert_thumbnail` mutation  and `thumbnail` query_) under:
	 
		```
		urls {
		      _256 #url of 256x256 thumbnail
		      _512 #url of 512x512 thumbnail
	    	}
		```
	- 
     
2. (**_minor bonus_**) Files are served using [minio](https://docs.min.io/). 
3. (**_big bonus_**) Add an additional `thumbnail` Subscription with exact spec with its Query counterpart
	-  `insert_thumbnail` Mutation will immediately return a response with _**`status`**:`processing`_ and upon generation completion it needs to be resolved with _**`status`**:`failed`_ or _`completed`_.
	- Subscription will emit complete object on each `status` change.


### remarks:
- DB usage is not mandatory
- [Puppeteer](https://pptr.dev/) is your friend.

## Installation help info

```
	// for local env
	cp .env.example .env
	// change .env to your credentials
	yarn install 
	yarn start:dev

	// or using docker
	docker-compose up -d 
```
   
