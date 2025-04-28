Running carbone in docker for development

```docker run -d -p 4000:4000 carbone/carbone-ee```

On VPS add this to docker-compose.yml

```carbone/carbone-ee:full-fonts```

and expose container port 4000 as 4000
