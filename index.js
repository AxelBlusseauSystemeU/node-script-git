const axios = require('axios').default;
const ObjectsToCsv = require('objects-to-csv')

// Récupération des équipes de l'organisation
async function getTeams(){
    let teams = [];
    let goNextPage = true;
    try{
        let page = 1;
        while(goNextPage){
            const res = await axios.get('https://api.github.com/orgs/ugieiris/teams?per_page=100&page=' + page, {
                auth: {
                    username: '', // Your git username
                    password: '' // Your git token
                }
            });

            if (res.data.length !== 0) { 
                teams = teams.concat(res.data);
                page++;
            } else { goNextPage = false }
        }
        return teams;
    } catch(e){
        console.log(e)
    }
}

// Pour chaque équipe on va chercher tous les utilisateurs
async function getTeamMembers(team){
    let members = [];
    let goNextPage = true;
    try{
        let page = 1;
        while(goNextPage){
            const res = await axios.get(`https://api.github.com/organizations/25059336/team/${team.id}/members?per_page=100&page=${page}`, {
                auth: {
                    username: '', // Your git username
                    password: '' // Your git token
                }
            });

            if (res.data.length !== 0) { 
                members = members.concat(res.data);
                page++;
            } else { goNextPage = false }
        }

        const finalResult = { teamName: team.name, members: [] }
        members.forEach(member => {
            finalResult.members.push(member.login)
        });
        return finalResult;
    } catch(e){
        console.log(e)
    }
}

function listUsersWithTheirTeams(teams){
    const finalResult = [];
    //Pour chaque équipe
    teams.forEach(team => {
        team.members.forEach(member => {
            const user = finalResult.find(obj => obj?.username === member)
            if(user){
                user.teams.push(team.teamName)
            } else {
                const newUser = { username: member, teams: [team.teamName] }
                finalResult.push(newUser)
            }
        });
    });
    return finalResult;
}

async function main() {
    const teamsWithMembers = [];

    const teams = await getTeams();

    //const echantillonTeams = teams.slice(0,10);

    for (const team of teams) {
        const res = await getTeamMembers(team)
        teamsWithMembers.push(res)
    }

    // Formatted result with users with their teams
    const formattedResult = listUsersWithTheirTeams(teamsWithMembers);

    // Création du CSV
    const csv = new ObjectsToCsv(formattedResult)
    await csv.toDisk('./res.csv')
}

main();

