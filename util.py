import requests

endpoint = "http://ddragon.leagueoflegends.com/cdn/13.13.1/data/en_US/champion.json"

response = requests.get(endpoint)
data = response.json()

champions = data["data"]

for champion_data in champions.values():
    name = champion_data["name"]
    snippet = f'{{ name: "{name}" }}, '
    print(snippet)
