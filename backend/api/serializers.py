from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class AdminLoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email or ''
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_staff:
            raise serializers.ValidationError({
                'detail': 'Доступ разрешён только администратору.'
            })
        
        return {
            'data': {
                'access': data['access'],
                'refresh': data['refresh'],
                'user': {
                    'id': self.user.id,
                    'email': self.user.email,
                    'role': 'ADMIN',
                }
            }
        }
        