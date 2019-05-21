<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use App\Entity\User;

class UserFixtures extends Fixture
{
    // see https://symfony.com/doc/current/security.html
    // manually encode a password => php bin/console security:encode-password

    /**
     * @var UserPasswordEncoderInterface
     */
    private $passwordEncoder;

    /**
     * construct UserFixtures
     *
     * @param UserPasswordEncoderInterface $passwordEncoder
     */
    public function __construct(UserPasswordEncoderInterface $passwordEncoder)
    {
        $this->passwordEncoder = $passwordEncoder;
    }

    public function load(ObjectManager $manager)
    {
        $user = new User();
        $user->setEmail('jean.philippe.debos@gmail.com');
        $user->setName('admin');
        $user->setRoles(['ROLE_ADMIN', 'ROLE_USER']);
        $user->setPassword('admin');
        $user->setLvl(1);
        $manager->persist($user);

        $manager->flush();
    }
}
