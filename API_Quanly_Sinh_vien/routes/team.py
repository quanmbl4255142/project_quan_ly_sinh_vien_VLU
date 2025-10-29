from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Team, TeamMember, Student, Project
from sqlalchemy import and_

team_bp = Blueprint('team', __name__)

@team_bp.route('/', methods=['GET'])
@jwt_required()
def get_teams():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        project_id = request.args.get('project_id', type=int)
        
        query = Team.query
        
        if search:
            query = query.filter(Team.team_name.contains(search))
        
        if status:
            query = query.filter(Team.status == status)
        
        if project_id:
            query = query.filter(Team.project_id == project_id)
        
        teams = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Add member info to each team
        teams_data = []
        for team in teams.items:
            team_data = team.to_dict()
            team_data['members'] = []
            for member in team.members:
                if member.status == 'active':
                    member_data = member.to_dict()
                    member_data['student'] = member.student.to_dict()
                    team_data['members'].append(member_data)
            team_data['member_count'] = len(team_data['members'])
            teams_data.append(team_data)
        
        return jsonify({
            'teams': teams_data,
            'total': teams.total,
            'pages': teams.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@team_bp.route('/<int:team_id>', methods=['GET'])
@jwt_required()
def get_team(team_id):
    try:
        team = Team.query.get(team_id)
        
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        
        team_data = team.to_dict()
        team_data['members'] = []
        for member in team.members:
            if member.status == 'active':
                member_data = member.to_dict()
                member_data['student'] = member.student.to_dict()
                team_data['members'].append(member_data)
        
        team_data['project'] = team.project.to_dict()
        team_data['member_count'] = len(team_data['members'])
        
        return jsonify({'team': team_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@team_bp.route('/', methods=['POST'])
@jwt_required()
def create_team():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['team_name', 'project_id', 'leader_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if project exists
        project = Project.query.get(data['project_id'])
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if leader exists
        leader = Student.query.get(data['leader_id'])
        if not leader:
            return jsonify({'error': 'Student leader not found'}), 404
        
        # Check if team name is unique for this project
        existing_team = Team.query.filter_by(
            team_name=data['team_name'],
            project_id=data['project_id']
        ).first()
        if existing_team:
            return jsonify({'error': 'Team name already exists for this project'}), 400
        
        # Create team
        team = Team(
            team_name=data['team_name'],
            project_id=data['project_id'],
            leader_id=data['leader_id'],
            status=data.get('status', 'forming')
        )
        
        db.session.add(team)
        db.session.flush()  # Get the team ID
        
        # Add leader as team member
        leader_member = TeamMember(
            team_id=team.id,
            student_id=data['leader_id'],
            role='leader'
        )
        db.session.add(leader_member)
        
        # Add other members if provided
        if data.get('member_ids'):
            for member_id in data['member_ids']:
                # Check if student exists and is not already in another active team for this project
                student = Student.query.get(member_id)
                if not student:
                    continue
                
                existing_membership = TeamMember.query.join(Team).filter(
                    and_(
                        TeamMember.student_id == member_id,
                        Team.project_id == data['project_id'],
                        TeamMember.status == 'active'
                    )
                ).first()
                
                if not existing_membership:
                    member = TeamMember(
                        team_id=team.id,
                        student_id=member_id,
                        role='member'
                    )
                    db.session.add(member)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Team created successfully',
            'team': team.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@team_bp.route('/<int:team_id>', methods=['PUT'])
@jwt_required()
def update_team(team_id):
    try:
        team = Team.query.get(team_id)
        
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'team_name' in data:
            team.team_name = data['team_name']
        if 'status' in data:
            team.status = data['status']
            if data['status'] == 'completed':
                team.completed_at = db.func.now()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Team updated successfully',
            'team': team.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@team_bp.route('/<int:team_id>', methods=['DELETE'])
@jwt_required()
def delete_team(team_id):
    try:
        team = Team.query.get(team_id)
        
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        
        db.session.delete(team)
        db.session.commit()
        
        return jsonify({'message': 'Team deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@team_bp.route('/<int:team_id>/members', methods=['POST'])
@jwt_required()
def add_team_member(team_id):
    try:
        team = Team.query.get(team_id)
        
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        
        data = request.get_json()
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'Student ID is required'}), 400
        
        # Check if student exists
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Check if student is already in this team
        existing_member = TeamMember.query.filter_by(
            team_id=team_id,
            student_id=student_id
        ).first()
        
        if existing_member:
            if existing_member.status == 'active':
                return jsonify({'error': 'Student is already a member of this team'}), 400
            else:
                # Reactivate the member
                existing_member.status = 'active'
                existing_member.joined_at = db.func.now()
                existing_member.left_at = None
        else:
            # Check if team has reached max size
            active_members = TeamMember.query.filter_by(
                team_id=team_id,
                status='active'
            ).count()
            
            if active_members >= team.project.max_team_size:
                return jsonify({'error': 'Team has reached maximum size'}), 400
            
            # Add new member
            member = TeamMember(
                team_id=team_id,
                student_id=student_id,
                role='member'
            )
            db.session.add(member)
        
        db.session.commit()
        
        return jsonify({'message': 'Member added successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@team_bp.route('/<int:team_id>/members/<int:member_id>', methods=['DELETE'])
@jwt_required()
def remove_team_member(team_id, member_id):
    try:
        member = TeamMember.query.filter_by(
            team_id=team_id,
            id=member_id
        ).first()
        
        if not member:
            return jsonify({'error': 'Team member not found'}), 404
        
        member.status = 'left'
        member.left_at = db.func.now()
        
        db.session.commit()
        
        return jsonify({'message': 'Member removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@team_bp.route('/<int:team_id>/members/<int:member_id>/role', methods=['PUT'])
@jwt_required()
def update_member_role(team_id, member_id):
    try:
        member = TeamMember.query.filter_by(
            team_id=team_id,
            id=member_id
        ).first()
        
        if not member:
            return jsonify({'error': 'Team member not found'}), 404
        
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['leader', 'member']:
            return jsonify({'error': 'Invalid role'}), 400
        
        # If promoting to leader, demote current leader
        if new_role == 'leader':
            current_leader = TeamMember.query.filter_by(
                team_id=team_id,
                role='leader',
                status='active'
            ).first()
            
            if current_leader and current_leader.id != member_id:
                current_leader.role = 'member'
        
        member.role = new_role
        
        # Update team leader_id if this member becomes leader
        if new_role == 'leader':
            team = Team.query.get(team_id)
            team.leader_id = member.student_id
        
        db.session.commit()
        
        return jsonify({'message': 'Member role updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
